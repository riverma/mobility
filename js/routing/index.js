// Router selector. Returns null for unsupported profiles (e.g. 'transit') so the
// engine can skip them silently — avoids forcing every caller to special-case.
//
// The default (keyless) path is OSRM with an automatic Valhalla fallback: the two
// FOSSGIS services run separate per-profile backends, and one going down (observed
// 2026-07: routed-foot hanging 60s while car/bike answered in 200ms) surfaced as
// "Fetch is aborted" / timeout errors on individual mode cards.

import { OsrmRouter } from './osrm.js';
import { ValhallaRouter } from './valhalla.js';
import { GraphHopperRouter } from './graphhopper.js';

/** Tries the primary router; on any failure except a caller abort, tries the fallback. */
class FallbackRouter {
  constructor(primary, fallback) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async route(start, end, profile, opts = {}) {
    try {
      return await this.primary.route(start, end, profile, opts);
    } catch (err) {
      // User cancelled (new Compare, changed settings) — propagate, don't mask.
      if (opts.signal?.aborted) throw err;
      return await this.fallback.route(start, end, profile, opts);
    }
  }
}

const defaultSingleton = new FallbackRouter(new OsrmRouter(), new ValhallaRouter());

/**
 * @param {{ graphhopperKey?: string }} settings
 * @param {'car'|'bicycle'|'ebike'|'foot'|'transit'} profile
 * @returns {{route: Function} | null}
 */
export function getRouter(settings, profile) {
  if (profile === 'transit') return null;     // RESERVED for v2
  const key = settings?.graphhopperKey?.trim();
  if (key) return new FallbackRouter(new GraphHopperRouter(key), defaultSingleton);
  return defaultSingleton;
}
