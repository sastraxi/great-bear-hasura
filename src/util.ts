import Express from 'express';

export const SEC_TO_MS = 1000;

export interface LatLon {
  lat: number,
  lon: number,
}

export const rowFromRequest = (req: Express.Request) =>
  req.body.event ? req.body.event.data.new : req.body;

export const fromCoord = (geoJSON: string): LatLon => {
  if (!geoJSON) return null;
  const { coordinates } = JSON.parse(geoJSON);
  return { // notice it's flipped in postgis
    lat: coordinates[1],
    lon: coordinates[0],
  };
};

export const tween = (a: number, b: number, pct: number): number =>
  (1 - pct) * a + pct * b;

export const mix = (a: LatLon, b: LatLon, pct: number): LatLon => ({
  lat: tween(a.lat, b.lat, pct),
  lon: tween(a.lon, b.lon, pct),
})

/**
 * A valid password has at least 8 characters and contains letters and numbers.
 * This is required for PCI compliance through Stripe.
 */
export const isValidPassword = (password: string) => {
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[a-z]/i.test(password)) return false;
  return true;
};
