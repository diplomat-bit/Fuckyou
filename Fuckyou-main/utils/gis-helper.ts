export interface Coordinate {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface WebMercatorCoordinate {
  x: number;
  y: number;
}

export interface GeoJSONGeometry {
  type: "Point" | "Polygon" | "MultiPolygon" | "LineString";
  coordinates: any;
}

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

const EARTH_RADIUS_METERS = 6371008.8; // WGS84 mean radius

/**
 * Converts WGS84 Geodetic coordinates (Latitude, Longitude) to Web Mercator (EPSG:3857) meters.
 * Crucial for interacting with standard web mapping APIs (Mapbox, Google Maps, Esri).
 */
export function wgs84ToWebMercator(coord: Coordinate): WebMercatorCoordinate {
  const x = (coord.lng * Math.PI * EARTH_RADIUS_METERS) / 180;
  let y = Math.log(Math.tan(((90 + coord.lat) * Math.PI) / 360)) * EARTH_RADIUS_METERS;
  
  // Prevent infinity at poles
  const maxMercatorY = 20037508.34;
  if (y > maxMercatorY) y = maxMercatorY;
  if (y < -maxMercatorY) y = -maxMercatorY;

  return { x, y };
}

/**
 * Converts Web Mercator (EPSG:3857) meters back to WGS84 Geodetic coordinates (Latitude, Longitude).
 */
export function webMercatorToWGS84(mercator: WebMercatorCoordinate): Coordinate {
  const lng = (mercator.x * 180) / (Math.PI * EARTH_RADIUS_METERS);
  let lat = (mercator.y / EARTH_RADIUS_METERS) * (180 / Math.PI);
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return { lat, lng };
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula.
 * Returns distance in meters. Useful for proximity searches on real estate or tax lien properties.
 */
export function calculateHaversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates the bounding box for a given set of coordinates.
 * Essential for zooming maps to fit specific parcels, tax lien properties, or neighborhoods.
 */
export function calculateBoundingBox(coordinates: Coordinate[]): BoundingBox {
  if (!coordinates || coordinates.length === 0) {
    throw new Error("Cannot calculate bounding box for empty coordinate array.");
  }

  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  for (const coord of coordinates) {
    if (coord.lat < minLat) minLat = coord.lat;
    if (coord.lng < minLng) minLng = coord.lng;
    if (coord.lat > maxLat) maxLat = coord.lat;
    if (coord.lng > maxLng) maxLng = coord.lng;
  }

  return { minLat, minLng, maxLat, maxLng };
}

/**
 * Expands a bounding box by a given buffer distance in meters.
 * Useful for querying government GIS APIs with a search radius around a property.
 */
export function expandBoundingBox(bbox: BoundingBox, bufferMeters: number): BoundingBox {
  // Degree approximations at the equator
  const latBuffer = (bufferMeters / EARTH_RADIUS_METERS) * (180 / Math.PI);
  // Adjust longitude buffer based on average latitude of the bounding box
  const avgLat = (bbox.minLat + bbox.maxLat) / 2;
  const lngBuffer = latBuffer / Math.cos((avgLat * Math.PI) / 180);

  return {
    minLat: bbox.minLat - latBuffer,
    minLng: bbox.minLng - lngBuffer,
    maxLat: bbox.maxLat + latBuffer,
    maxLng: bbox.maxLng + lngBuffer,
  };
}

/**
 * Determines if a coordinate point is inside a polygon using the Ray-Casting (Jordan Curve) algorithm.
 * Used to verify if a specific house or tax lien parcel falls within a specific zoning district or county boundary.
 */
export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates the approximate area of a polygon on the Earth's surface in square meters.
 * Uses the spherical Weyl/Shoelace formula. Crucial for evaluating land parcel sizes.
 */
export function calculatePolygonArea(polygon: Coordinate[]): number {
  if (polygon.length < 3) return 0;

  let totalArea = 0;
  const len = polygon.length;

  for (let i = 0; i < len; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % len];

    const lambda1 = (p1.lng * Math.PI) / 180;
    const lambda2 = (p2.lng * Math.PI) / 180;
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;

    totalArea += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  totalArea = (totalArea * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2.0;
  return Math.abs(totalArea);
}

/**
 * Generates a standard GeoJSON Feature Collection from a list of properties/parcels.
 * Perfect for feeding directly into Mapbox GL JS, Leaflet, or Google Maps GeoJSON layers.
 */
export function generateParcelGeoJSON(
  parcels: Array<{
    id: string;
    coordinates: Coordinate[];
    properties: Record<string, any>;
  }>
): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = parcels.map((parcel) => {
    // Ensure polygon is closed for GeoJSON compliance
    const coords = parcel.coordinates.map((c) => [c.lng, c.lat]);
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push([coords[0][0], coords[0][1]]);
    }

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
      properties: {
        parcelId: parcel.id,
        ...parcel.properties,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Generates a static map image URL using OpenStreetMap/CartoDB tiles for quick dashboard previews.
 * Useful for showing a quick snapshot of a tax lien property or house without loading a heavy interactive map.
 */
export function getStaticMapUrl(
  center: Coordinate,
  zoom: number = 15,
  width: number = 600,
  height: number = 400
): string {
  // Using CartoDB Positron as a clean, reliable, free static map tile provider alternative
  // Note: For production, you can swap this with Mapbox Static Images API or Google Static Maps API
  const tileX = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom));
  const tileY = Math.floor(
    ((1 -
      Math.log(
        Math.tan((center.lat * Math.PI) / 180) +
          1 / Math.cos((center.lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );

  return `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tileX}/${tileY}.png`;
}

/**
 * Converts a BoundingBox to a standard Leaflet/Mapbox LatLngBounds literal format.
 */
export function toLatLngBounds(bbox: BoundingBox): [[number, number], [number, number]] {
  return [
    [bbox.minLat, bbox.minLng],
    [bbox.maxLat, bbox.maxLng],
  ];
}

/**
 * Generates styling rules for GIS map rendering based on property status (e.g., Tax Delinquent, Foreclosed, Active).
 * Helps investors visually identify high-value tax lien opportunities instantly.
 */
export function getParcelStyleByStatus(status: string): {
  fillColor: string;
  color: string;
  weight: number;
  fillOpacity: number;
} {
  switch (status.toLowerCase()) {
    case "delinquent":
      return { fillColor: "#FF4D4F", color: "#D9363E", weight: 2, fillOpacity: 0.6 };
    case "tax_lien":
      return { fillColor: "#FAAD14", color: "#D48806", weight: 2, fillOpacity: 0.6 };
    case "foreclosed":
      return { fillColor: "#722ED1", color: "#531DAB", weight: 2, fillOpacity: 0.6 };
    case "auction_active":
      return { fillColor: "#52C41A", color: "#389E0D", weight: 3, fillOpacity: 0.7 };
    case "owned":
      return { fillColor: "#1890FF", color: "#096DD9", weight: 2, fillOpacity: 0.5 };
    default:
      return { fillColor: "#D9D9D9", color: "#BFBFBF", weight: 1, fillOpacity: 0.3 };
  }
}

/**
 * Decodes a Google Maps encoded polyline string into an array of Coordinates.
 * Frequently used when parsing routing or boundary data from external government/transportation APIs.
 */
export function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return coordinates;
}

export const gisHelper = {
  wgs84ToWebMercator,
  webMercatorToWGS84,
  calculateHaversineDistance,
  calculateBoundingBox,
  expandBoundingBox,
  isPointInPolygon,
  calculatePolygonArea,
  generateParcelGeoJSON,
  getStaticMapUrl,
  toLatLngBounds,
  getParcelStyleByStatus,
  decodePolyline,
};

export default gisHelper;
