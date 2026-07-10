// Valhalla adapter — FOSSGIS-hosted public instance at valhalla1.openstreetmap.de.
// Used as the automatic FALLBACK when the primary OSRM instance times out or errors:
// the two services run on separate backends, so a per-profile OSRM outage (observed
// 2026-07 on routed-foot) doesn't take the mode down. No API key required; CORS-clean
// from github.io origin (verified 2026-07-06 pre-flight).

import { httpGetJson, HttpError } from '../util/http.js';
import { EBIKE_DURATION_MULTIPLIER } from '../data/constants.js';
import { CAVEATS } from '../data/caveats.js';

const BASE = 'https://valhalla1.openstreetmap.de/route';

const PROFILE_TO_COSTING = {
  car:     'auto',
  bicycle: 'bicycle',
  ebike:   'bicycle',   // No free e-bike costing; duration scaled below, same as OSRM.
  foot:    'pedestrian',
};

const PROFILE_TO_MODE = {
  car: 'drive', bicycle: 'bike', ebike: 'ebike', foot: 'walk',
};

export class ValhallaRouter {
  /**
   * @param {LatLon} start
   * @param {LatLon} end
   * @param {'car'|'bicycle'|'ebike'|'foot'} profile
   * @param {{ signal?: AbortSignal }} [opts]
   * @returns {Promise<RouteResult>}
   */
  async route(start, end, profile, opts = {}) {
    const costing = PROFILE_TO_COSTING[profile];
    if (!costing) throw new Error(`Valhalla: unsupported profile "${profile}"`);

    const req = {
      locations: [
        { lat: start.lat, lon: start.lon },
        { lat: end.lat,   lon: end.lon },
      ],
      costing,
      directions_options: { units: 'kilometers' },
    };
    const url = `${BASE}?json=${encodeURIComponent(JSON.stringify(req))}`;

    const json = await httpGetJson(url, { signal: opts.signal });
    const trip = json?.trip;
    if (!trip?.legs?.length || !trip.summary) {
      throw new HttpError(`Valhalla ${profile}: ${json?.error || 'no route'}`, 0);
    }

    let duration_s = trip.summary.time;
    const caveats = [];
    if (profile === 'ebike') {
      duration_s = duration_s * EBIKE_DURATION_MULTIPLIER;
      caveats.push(CAVEATS.ebikeRoutingApprox);
    }

    // Legs carry an encoded polyline (1e-6 precision) — decode to GeoJSON for Leaflet.
    const coords = trip.legs.flatMap((leg) => decodePolyline(leg.shape));
    const geometry = { type: 'LineString', coordinates: coords };
    const distance_m = trip.summary.length * 1000;   // summary.length is km (requested above)

    /** @type {RouteResult} */
    return {
      distance_m,
      duration_s,
      geometry,
      legs: [{
        distance_m,
        duration_s,
        geometry,
        mode: PROFILE_TO_MODE[profile],
      }],
      provider: 'valhalla',
      profile,
      raw: trip,
      caveats,
    };
  }
}

/**
 * Decode a Valhalla encoded polyline (Google polyline algorithm, 1e-6 precision)
 * into GeoJSON-ordered [lon, lat] pairs.
 * @param {string} str
 * @returns {Array<[number, number]>}
 */
function decodePolyline(str, precision = 6) {
  const factor = Math.pow(10, precision);
  const coords = [];
  let index = 0, lat = 0, lon = 0;
  while (index < str.length) {
    let result = 0, shift = 0, byte;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    result = 0; shift = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lon += (result & 1) ? ~(result >> 1) : (result >> 1);
    coords.push([lon / factor, lat / factor]);
  }
  return coords;
}
