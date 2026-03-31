type NagerHoliday = { date: string; localName: string; name: string };

const cache = new Map<string, { at: number; data: NagerHoliday[] }>();
const TTL_MS = 1000 * 60 * 60 * 24;

export async function fetchPublicHolidays(year: number, countryCode: string): Promise<NagerHoliday[]> {
  const key = `${year}-${countryCode}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data;
  }

  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Holiday API error: ${res.status}`);
  }
  const data = (await res.json()) as NagerHoliday[];
  cache.set(key, { at: Date.now(), data });
  return data;
}
