import Express from 'express';

interface LatLon {
  lat: Number,
  lon: Number,
}

export const orderFromRequest = (req: Express.Request) =>
  req.body.event ? req.body.event.data.new : req.body;

export const fromCoord = (geoJSON: string): LatLon => {
  if (!geoJSON) return null;
  const { coordinates } = JSON.parse(geoJSON);
  return {
    lat: coordinates[1],
    lon: coordinates[0],
  };}
;
