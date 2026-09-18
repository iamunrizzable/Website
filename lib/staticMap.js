// Static map preview built from raw OSM tile images (https://
// operations.osmfoundation.org/policies/tiles/ — direct <img> use is fine
// for this volume: an internal admin tool, viewed occasionally, well
// within their "reasonable use" policy). Deliberately NOT a JS-driven
// osm.org/export/embed.html iframe — that requires a script to execute
// inside a cross-origin frame, which browsers with aggressive tracking
// prevention (Safari in particular) can silently block, rendering
// nothing with no visible error. A grid of plain PNG tiles has no such
// failure mode — it's just image requests. Shared between
// app/admin/security/page.js and app/admin/visitor/list/page.js — both
// need the exact same location preview.
const TILE_SIZE = 256;
// Zoom 6 (the original value) covers hundreds of miles per tile — at a
// 3x3 grid that's most of a country, useless for "where is this visitor."
// 11 is roughly city/metro-area scale, a reasonable match for how precise
// IP-based geolocation actually is (rarely better than city-level anyway).
const MAP_ZOOM = 11;
const MAP_GRID = 3; // 3x3 tiles

function lonToTileX(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}
function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom);
}
function lonToPixelX(lon, zoom) {
  return ((lon + 180) / 360) * 2 ** zoom * TILE_SIZE;
}
function latToPixelY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom * TILE_SIZE;
}

export function renderStaticMap(latStr, lonStr) {
  const lat = Number(latStr);
  const lon = Number(lonStr);
  const zoom = MAP_ZOOM;
  const centerTileX = lonToTileX(lon, zoom);
  const centerTileY = latToTileY(lat, zoom);
  const gridOriginPixelX = (centerTileX - 1) * TILE_SIZE;
  const gridOriginPixelY = (centerTileY - 1) * TILE_SIZE;
  const pinLeftPct = ((lonToPixelX(lon, zoom) - gridOriginPixelX) / (TILE_SIZE * MAP_GRID)) * 100;
  const pinTopPct = ((latToPixelY(lat, zoom) - gridOriginPixelY) / (TILE_SIZE * MAP_GRID)) * 100;

  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({ x: centerTileX + dx, y: centerTileY + dy, key: `${dx}-${dy}` });
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: TILE_SIZE * MAP_GRID, aspectRatio: '1 / 1', marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${MAP_GRID}, 1fr)`, gridTemplateRows: `repeat(${MAP_GRID}, 1fr)` }}>
        {tiles.map((t) => (
          <img
            key={t.key}
            src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            // A 3-column CSS grid on a container width that isn't a clean
            // multiple of 3 (any phone screen) leaves a hairline gap
            // between tiles from browser subpixel rounding — visible as a
            // thin seam cutting across the map. A 1px negative-margin
            // overlap on every side hides that rounding error behind the
            // adjacent tile instead of leaving a gap; overflow:hidden on
            // the outer container (below) trims the sliver this bleeds
            // past the grid's outer edge.
            style={{ width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', margin: -1, display: 'block' }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${pinLeftPct}%`,
          top: `${pinTopPct}%`,
          transform: 'translate(-50%, -100%)',
          fontSize: 26,
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.7))',
          pointerEvents: 'none',
        }}
      >
        📍
      </div>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '1px 5px', borderRadius: 3, textDecoration: 'none' }}
      >
        © OpenStreetMap
      </a>
    </div>
  );
}
