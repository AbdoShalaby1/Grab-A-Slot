import "../src/loadEnv.js";
import { prisma } from "../src/lib/prisma.js";

const BASE_URL = process.env.API_URL || "http://localhost:3000/api";

async function makeRequest(method: string, endpoint: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

async function testConcurrentBooking() {
  console.log("🧪 Testing concurrent booking prevention...\n");

  // Setup: Create admin user
  const adminRes = await makeRequest("POST", "/auth/register", {
    email: `admin-${Date.now()}@test.com`,
    password: "password123",
    name: "Admin",
  });
  console.log("✓ Admin created");

  const adminLoginRes = await makeRequest("POST", "/auth/login", {
    email: adminRes.data.user.email,
    password: "password123",
  });
  const adminToken = adminLoginRes.data.token;

  // Create time slot
  const slotRes = await makeRequest("POST", "/admin/time-slots", {
    startAt: new Date(Date.now() + 3600000).toISOString(),
    endAt: new Date(Date.now() + 7200000).toISOString(),
  }, adminToken);
  const timeSlotId = slotRes.data.slot.id;
  console.log(`✓ Time slot created (ID: ${timeSlotId})`);

  // Create 5 users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const res = await makeRequest("POST", "/auth/register", {
      email: `user${i}-${Date.now()}@test.com`,
      password: "password123",
      name: `User ${i}`,
    });
    const loginRes = await makeRequest("POST", "/auth/login", {
      email: res.data.user.email,
      password: "password123",
    });
    users.push(loginRes.data.token);
  }
  console.log(`✓ Created 5 test users`);

  // Try to book same slot concurrently
  console.log("\n📋 Attempting 5 concurrent bookings on same slot...");
  const bookingPromises = users.map((token) =>
    makeRequest("POST", "/appointments", { timeSlotId }, token)
  );

  const results = await Promise.all(bookingPromises);

  const successCount = results.filter((r) => r.status === 201).length;
  const conflictCount = results.filter((r) => r.status === 409).length;

  console.log(`\n📊 Results:`);
  console.log(`  ✓ Successful bookings: ${successCount}`);
  console.log(`  ✗ Conflicts (409): ${conflictCount}`);

  if (successCount === 1 && conflictCount === 4) {
    console.log("\n✅ PASS: Double-booking prevention works correctly!");
  } else {
    console.log("\n❌ FAIL: Unexpected booking results");
  }

  // Cleanup
  await prisma.appointment.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("\n🧹 Cleaned up test data");
}

testConcurrentBooking()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
