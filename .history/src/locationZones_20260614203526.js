export const LOCATION_ZONES = [
  {
    name: 'zion',
    label: 'Zion National Park',
    bounds: { minLat: 37.1, maxLat: 37.5, minLon: -113.3, maxLon: -112.8 }
  },
  {
    name: 'ireland',
    label: 'Ireland',
    bounds: { minLat: 51.3, maxLat: 55.5, minLon: -10.7, maxLon: -5.9 }
  },
  {
    name: 'wisconsin',
    label: 'Wisconsin',
    bounds: { minLat: 42.5, maxLat: 47.1, minLon: -92.9, maxLon: -86.2 }
  }
];

export function detectLocation(lat, lon) {
  for (const zone of LOCATION_ZONES) {
    const { minLat, maxLat, minLon, maxLon } = zone.bounds;
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      return zone;
    }
  }
  return null;
}
