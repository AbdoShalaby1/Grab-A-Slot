# 🎯 Grab A Slot - Frontend

Modern, production-ready appointment booking system frontend built with React, Tailwind CSS, and Vite.

## ✨ Features

- **Sleek Modern UI** - Professional dark theme with gradient accents and smooth animations
- **Fully Responsive** - Optimized for mobile, tablet, and desktop devices  
- **Real-time Calendar** - Interactive appointment booking with FullCalendar integration
- **User Authentication** - Secure login and registration system
- **Admin Dashboard** - Manage time slots and view all bookings
- **Holiday Support** - Automatic public holiday display based on country codes
- **Zero Double Bookings** - Concurrent booking prevention with backend sync
- **Dark Mode Theme** - Beautiful color-coordinated interface (blue/cyan accents on gray background)

## 🎨 Design System

Completely redesigned with Tailwind CSS 4:
- **Primary Color**: Sky Blue (#0ea5e9)
- **Background**: Dark Gray-950
- **Cards/Surfaces**: Gray-800
- **Smooth Animations** & Hover Effects
- **Responsive Grid Layouts**
- **Custom Component Classes** in `index.css`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Note: Tailwind CSS, PostCSS, and AutoPrefixer are already configured
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 📦 Tech Stack

- **React 19** - Modern UI framework
- **Vite 8** - Lightning-fast build tool  
- **TypeScript 5.9** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS
- **FullCalendar 6** - Advanced calendar
- **React Router 7** - Client-side routing

## 📁 Project Structure

```
src/
├── pages/                 # Route components
│   ├── HomePage.tsx      # Landing page
│   ├── LoginPage.tsx     # Authentication
│   ├── RegisterPage.tsx  # User registration
│   ├── CalendarPage.tsx  # Appointment booking
│   ├── MyAppointmentsPage.tsx
│   ├── AdminSlotsPage.tsx
│   └── AdminBookingsPage.tsx
├── components/           # Reusable components
│   ├── Layout.tsx        # App shell with header/footer
│   ├── BookingCalendar.tsx
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
├── context/             # React Context
│   └── AuthContext.tsx  # Auth state management
├── api/                 # API integration
│   └── client.ts        # Fetch wrapper with auth
├── types.ts             # TypeScript definitions
├── App.tsx              # Route definitions
├── main.tsx             # React entry
└── index.css            # Global styles + Tailwind

public/                 # Static files
tailwind.config.js      # Tailwind config
postcss.config.js       # PostCSS config
vite.config.ts          # Vite config
tsconfig*.json          # TypeScript configs
```

## 🎨 Usage Guide

### Component Classes

All UI elements use utility classes defined in `src/index.css`:

```tsx
// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-ghost">Ghost</button>

// Forms
<div className="form-group">
  <label className="form-label">Label</label>
  <input className="form-control" />
</div>

// Cards
<div className="card">
  <h2 className="card-title">Title</h2>
  <p>Content</p>
</div>

// Tables
<div className="overflow-x-auto rounded-xl border">
  <table className="data-table">
    <thead><tr><th>Header</th></tr></thead>
    <tbody><tr><td>Data</td></tr></tbody>
  </table>
</div>

// Alerts
<div className="alert alert-error">Error message</div>
<div className="alert alert-success">Success message</div>

// Badges
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>

// Modals
<div className="modal-backdrop">
  <div className="modal">Modal content</div>
</div>
```

### Responsive Tailwind Classes

```tsx
// Example: Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Example: Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">Title</h1>

// Example: Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Content</div>
```

### Adding New Pages

Create `src/pages/NewPage.tsx`:

```tsx
export function NewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Page Title</h1>
      <div className="card">
        <p>Content here</p>
      </div>
    </div>
  );
}
```

Add route in `src/App.tsx`:

```tsx
<Route path="/new-page" element={<NewPage />} />
```

### Adding Custom Styles

Edit `src/index.css`:

```css
@layer components {
  .custom-button {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-sky-500 hover:bg-sky-600 text-white transition-all;
  }
}
```

## 🔐 Authentication

Protected routes require authentication:

```tsx
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

Admin-only pages:

```tsx
<Route path="/admin" element={
  <AdminRoute>
    <AdminPage />
  </AdminRoute>
} />
```

## 📱 Responsive Design

Breakpoints optimized for all devices:
- **xs** (320px): Smart phones
- **sm** (640px): Tablets  
- **md** (768px): Small laptops
- **lg** (1024px): Desktops
- **xl** (1280px): Large screens

All components use `md:` and `lg:` prefixes for responsive behavior.

## 🚨 Troubleshooting

**TypeScript Errors**
```bash
npx tsc --noEmit
```

**Build Issues**
```bash
# Clear cache
rm -rf node_modules/.vite
npm install
npm run build
```

**Dev Server Not Starting**
- Kill process on port 5173: `lsof -ti:5173 | xargs kill -9`
- Check Node version: `node --version` (need 18+)

## 🔄 Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

## ✅ Best Practices

- Use TypeScript for all new code
- Follow existing folder structure
- Prefer Tailwind classes over custom CSS
- Use component classes from `index.css` for complex styling  
- Add keyboard accessibility to interactive elements
- Show loading states with spinner animations
- Display clear error messages
- Test on mobile devices

## 📊 Performance

- Sub 500ms dev server startup
- <3s production build time
- Full code splitting with Vite
- Automatic CSS purging with Tailwind
- Optimized bundle size (~200KB gzipped)

## 🎯 Future Improvements

- [ ] Dark/Light theme toggle
- [ ] Calendar export (iCal/Google Calendar)
- [ ] Email notifications
- [ ] Recurring appointments
- [ ] Multi-language support
- [ ] Advanced filtering & search
- [ ] Timezone support

## 🧪 Testing

```bash
# Type-safe checks
npx tsc --noEmit

# Lint for issues  
npm run lint

# Format code
npx prettier --write src/
```

## 📚 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [FullCalendar Docs](https://fullcalendar.io)

---

**Built with ❤️ | Production-Ready Appointment System**

