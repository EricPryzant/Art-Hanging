/** app.js — UMD + babel-standalone compatible (no imports)
 * - Works with React/ReactDOM UMD + <script type="text/babel"> in your index.html
 * - Wire + D-Ring (two-nail) support, hangerOffset, unit toggle, vertical/horizontal/custom layouts
 * - Correctly preserves string fields (mountingType) in updateArtwork
 */

const { useState } = React;

/* Minimal inline icons (no external deps) */
const IconCalc = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14" y2="14"/>
    <path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/>
    <path d="M12 14h.01"/><path d="M8 14h.01"/>
    <path d="M12 18h.01"/><path d="M8 18h.01"/>
  </svg>
);
const IconPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);
const IconTrash = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

/* Numeric fields whitelist for coercion */
const NUM_FIELDS = new Set([
  'width',
  'height',
  'wireOffset',
  'mountingVerticalOffset',
  'mountingHorizontalOffset',
  'hangerOffset',
]);

/* small helper */
function toNumberOrZero(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function round1(n) { return Math.round(n * 10) / 10; }

const ArtHangingCalculator = () => {
  const [units, setUnits] = useState('cm');          // 'cm' | 'inches'
  const [targetCentroid, setTargetCentroid] = useState(152.4); // 60" = 152.4 cm
  const [wallWidth, setWallWidth] = useState(0);
  const [configuration, setConfiguration] = useState('single'); // 'single' | 'vertical' | 'horizontal' | 'custom'

  const [artworks, setArtworks] = useState([
    {
      id: 1,
      width: 0,
      height: 0,
      mountingType: 'wire',           // 'wire' | 'dring'
      wireOffset: 0,                  // top -> wire (taut)
      mountingVerticalOffset: 0,      // top -> D-ring hole/eye
      mountingHorizontalOffset: 0,    // side -> D-ring center (each side)
      hangerOffset: 2.54,             // additional height nail sits above taut wire (~1" in cm)
    },
  ]);

  const [layout, setLayout] = useState({
    rows: 1,
    cols: 1,
    horizontalGap: 10,
    verticalGap: 10,
  });

  const unitLabel = (units === 'cm' ? 'cm' : 'in');

  // --- state helpers ---
  const addArtwork = () => {
    setArtworks(prev => prev.concat({
      id: Date.now(),
      width: 0,
      height: 0,
      mountingType: 'wire',
      wireOffset: 0,
      mountingVerticalOffset: 0,
      mountingHorizontalOffset: 0,
      hangerOffset: 2.54,
    }));
  };

  const removeArtwork = (id) => {
    setArtworks(prev => (prev.length > 1 ? prev.filter(a => a.id !== id) : prev));
  };

  // FIX: only coerce numeric fields; leave strings like `mountingType` untouched
  const updateArtwork = (id, field, value) => {
    setArtworks(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        if (NUM_FIELDS.has(field)) {
          return { ...a, [field]: toNumberOrNullSafe(value) };
        }
        return { ...a, [field]: value }; // string fields
      })
    );
  };
  function toNumberOrNullSafe(v) {
    const n = toNumberOrZero(v);
    return n;
  }

  const toggleUnits = () => {
    const newUnits = (units === 'inches' ? 'cm' : 'inches');
    const factor   = (newUnits === 'cm' ? 2.54 : 1 / 2.54);

    setUnits(newUnits);
    setTargetCentroid(prev => round1(prev * factor));
    setWallWidth(prev => (prev === 0 ? 0 : round1(prev * factor)));
    setArtworks(prev => prev.map(a => ({
      ...a,
      width:                    a.width ?  round1(a.width * factor)  : 0,
      height:                   a.height ? round1(a.height * factor) : 0,
      wireOffset:               a.wireOffset ? round1(a.wireOffset * factor) : 0,
      mountingVerticalOffset:   a.mountingVerticalOffset ? round1(a.mountingVerticalOffset * factor) : 0,
      mountingHorizontalOffset: a.mountingHorizontalOffset ? round1(a.mountingHorizontalOffset * factor) : 0,
      hangerOffset:             a.hangerOffset ? round1(a.hangerOffset * factor) : 0,
    })));
    setLayout(prev => ({
      ...prev,
      horizontalGap: round1(prev.horizontalGap * factor),
      verticalGap:   round1(prev.verticalGap   * factor),
    }));
  };

  // --- geometry helpers ---
  function groupStartX(totalW) {
    if (!wallWidth || !isFinite(wallWidth)) return 0;
    return (wallWidth - (totalW || 0)) / 2;
  }
  function nailHeightWire(art, centroid) {
    // centroid is vertical center of frame from floor
    return centroid + (art.height || 0) / 2 - (art.wireOffset || 0) + (art.hangerOffset || 0);
  }
  function nailHeightDRing(art, centroid) {
    return centroid + (art.height || 0) / 2 - (art.mountingVerticalOffset || 0);
  }

  // --- layout calculators ---
  function calcSingle() {
    const art = artworks[0] || {};
    const centroid = targetCentroid;

    if (art.mountingType === 'dring') {
      const totalW = art.width || 0;
      const startX = groupStartX(totalW);
      const leftX  = startX + (art.mountingHorizontalOffset || 0);
      const rightX = startX + totalW - (art.mountingHorizontalOffset || 0);
      const nh     = nailHeightDRing(art, centroid);

      return [{
        artwork: 1,
        isDRing: true,
        nailHeight: round1(nh).toFixed(2),
        centroid: round1(centroid).toFixed(2),
        horizontalDistance: round1(leftX).toFixed(2),
        horizontalDistance2: round1(rightX).toFixed(2),
        horizontalFromEdge: 'left',
        equation: `Nail = ${round1(centroid).toFixed(2)} + ${( (art.height||0)/2 ).toFixed(2)} - ${(art.mountingVerticalOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`,
        horizontalEquation:
          `Left = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 + ${(art.mountingHorizontalOffset||0).toFixed(2)} = ${round1(leftX).toFixed(2)}${unitLabel}; ` +
          `Right = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 + ${totalW.toFixed(2)} - ${(art.mountingHorizontalOffset||0).toFixed(2)} = ${round1(rightX).toFixed(2)}${unitLabel}`,
      }];
    }

    const hc = (wallWidth || 0) / 2;
    const nh = nailHeightWire(art, centroid);
    return [{
      artwork: 1,
      isDRing: false,
      nailHeight: round1(nh).toFixed(2),
      centroid: round1(centroid).toFixed(2),
      horizontalDistance: round1(hc).toFixed(2),
      horizontalFromEdge: 'center',
      equation: `Nail = ${round1(centroid).toFixed(2)} + ${( (art.height||0)/2 ).toFixed(2)} - ${(art.wireOffset||0).toFixed(2)} + ${(art.hangerOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`,
      horizontalEquation: `Horizontal = ${(wallWidth||0).toFixed(2)} / 2 = ${round1(hc).toFixed(2)}${unitLabel}`,
    }];
  }

  function calcVertical() {
    const totalH = artworks.reduce((s,a,i) => s + (a.height||0) + (i>0 ? (layout.verticalGap||0) : 0), 0);
    const groupC = totalH / 2;
    const offset = targetCentroid - groupC;
    const hc     = (wallWidth || 0) / 2;

    let cum = 0;
    return artworks.map((a,i) => {
      const artC  = cum + (a.height||0)/2 + offset; // centroid from floor
      const nh    = (a.mountingType === 'dring') ? nailHeightDRing(a, artC) : nailHeightWire(a, artC);
      let horiz;
      let horizEq;

      if (a.mountingType === 'dring') {
        const startX = groupStartX(a.width || 0);
        const leftX  = startX + (a.mountingHorizontalOffset || 0);
        const rightX = startX + (a.width || 0) - (a.mountingHorizontalOffset || 0);
        horiz = { isDRing:true, left:leftX, right:rightX, from:'left' };
        horizEq =
          `Left = ((${(wallWidth||0).toFixed(2)} - ${(a.width||0).toFixed(2)})/2) + ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(leftX).toFixed(2)}${unitLabel}; ` +
          `Right = ((${(wallWidth||0).toFixed(2)} - ${(a.width||0).toFixed(2)})/2) + ${(a.width||0).toFixed(2)} - ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(rightX).toFixed(2)}${unitLabel}`;
      } else {
        horiz = { isDRing:false, center:hc, from:'center' };
        horizEq = `Horizontal = ${(wallWidth||0).toFixed(2)} / 2 = ${round1(hc).toFixed(2)}${unitLabel}`;
      }

      const eq = (a.mountingType === 'dring')
        ? `GroupC=${groupC.toFixed(2)}; Offset=${offset.toFixed(2)}; Nail = ${round1(artC).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.mountingVerticalOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`
        : `GroupC=${groupC.toFixed(2)}; Offset=${offset.toFixed(2)}; Nail = ${round1(artC).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.wireOffset||0).toFixed(2)} + ${(a.hangerOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`;

      const res = {
        artwork: i+1,
        nailHeight: round1(nh).toFixed(2),
        centroid: round1(artC).toFixed(2),
        horizontalFromEdge: horiz.from,
        equation: eq,
        horizontalEquation: horizEq,
      };
      if (horiz.isDone) {} // no-op
      if (horiz.isDRing) {
        res.isDRing = true;
        res.horizontalDistance  = round1(horiz.left).toFixed(2);
        res.horizontalDistance2 = round1(horiz.right).toFixed(2);
      } else {
        res.isDRing = false;
        res.horizontalDistance = round1(horiz.center).toFixed(2);
      }

      if (i < artworks.length - 1) {
        cum += (a.height||0) + (layout.verticalGap || 0);
      }
      return res;
    });
  }

  function calcHorizontal() {
    const totalW = artworks.reduce((s,a,i) => s + (a.width||0) + (i>0 ? (layout.horizontalGap||0) : 0), 0);
    const startX = groupStartX(totalW);

    let cum = 0;
    return artworks.map((a,i) => {
      const leftX   = startX + cum;
      const centerX = leftX + (a.width||0)/2;
      const nh      = (a.mountingType === 'dring')
        ? nailHeightDRing(a, targetCentroid)
        : nailHeightWire(a, targetCentroid);

      const res = {
        artwork: i+1,
        nailHeight: round1(nh).toFixed(2),
        centroid: round1(targetCentroid).toFixed(2),
        horizontalFromEdge: 'left',
        equation: (a.mountingType === 'dring')
          ? `Nail = ${round1(targetCentroid).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.mountingVerticalOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`
          : `Nail = ${round1(targetCentroid).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.wireOffset||0).toFixed(2)} + ${(a.hangerOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`,
      };

      if (a.mountingType === 'dring') {
        const left  = leftX + (a.mountingHorizontalOffset || 0);
        const right = leftX + (a.width || 0) - (a.mountingHorizontalOffset || 0);
        res.isDRing = true;
        res.horizontalDistance  = round1(left).toFixed(2);
        res.horizontalDistance2 = round1(right).toFixed(2);
        res.horizontalEquation =
          `GroupStart = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 = ${round1(startX).toFixed(2)}${unitLabel}; ` +
          `Left = ${round1(startX).toFixed(2)} + ${round1(cum).toFixed(2)} + ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(left).toFixed(2)}${unitLabel}; ` +
          `Right = ${round1(startX).toFixed(2)} + ${round1(cum).toFixed(2)} + ${(a.width||0).toFixed(2)} - ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(right).toFixed(2)}${unitLabel}`;
      } else {
        res.isDRing = false;
        res.horizontalDistance = round1(centerX).toFixed(2);
        res.horizontalEquation =
          `GroupStart = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 = ${round1(startX).toFixed(2)}${unitLabel}; ` +
          `Center = ${round1(startX).toFixed(2)} + ${round1(cum).toFixed(2)} + ${((a.width||0)/2).toFixed(2)} = ${round1(centerX).toFixed(2)}${unitLabel}`;
      }

      if (i < artworks.length - 1) {
        cum += (a.width||0) + (layout.horizontalGap || 0);
      }
      return res;
    });
  }

  function calcCustom() {
    const rows = Math.max(1, toNumberOrZero(layout.rows));
    const cols = Math.max(1, toNumberOrZero(layout.cols));
    const hGap = toNumberOrZero(layout.horizontalGap);
    const vGap = toNumberOrZero(layout.verticalGap);

    // compute per-column max widths (only across the first rows*cols items)
    const maxItems = Math.min(artworks.length, rows * cols);
    const colWidths = [];
    for (let c = 0; c < cols; c++) {
      let mw = 0;
      for (let r = 0; r < rows; r++) {
        const idx = r * cols + c;
        if (idx >= maxItems) break;
        const w = artworks[idx] ? (artworks[idx].width || 0) : 0;
        if (w > mw) mw = w;
      }
      colWidths.push(mw);
    }
    const totalW = colWidths.reduce((s,w) => s + w, 0) + (cols > 1 ? (cols - 1) * hGap : 0);
    const startX = groupStartX(totalW);

    // per-row max heights
    const rowHeights = [];
    for (let r = 0; r < rows; r++) {
      let mh = 0;
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= maxItems) break;
        const h = artworks[idx] ? (artworks[idx].height || 0) : 0;
        if (h > mh) mh = h;
      }
      rowHeights.push(mh);
    }
    const totalH = rowHeights.reduce((s,h) => s + h, 0) + (rows > 1 ? (rows - 1) * vGap : 0);
    const gridC  = totalH / 2;
    const offset = targetCentroid - gridC;

    const results = [];
    for (let r = 0; r < rows; r++) {
      let heightAbove = 0;
      for (let rr = 0; rr < r; rr++) heightAbove += rowHeights[rr] + (rr < rows-1 ? vGap : 0);

      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= maxItems) break;
        const a = artworks[idx];

        const widthToLeft = colWidths.slice(0, c).reduce((s,w) => s + w, 0) + (c > 0 ? c * hGap : 0);
        const artLeftX    = startX + widthToLeft;
        const artCenterX  = artLeftX + (a.width || 0) / 2;

        const artC = heightAbove + (a.height || 0) / 2 + offset;
        const nh   = (a.mountingType === 'dring') ? nailHeightDRing(a, artC) : nailHeightWire(a, artC);

        const res = {
            artwork: idx + 1,
            position: `Row ${r+1}, Col ${c+1}`,
            nailHeight: round1(nh).toFixed(2),
            centroid: round1(artC).toFixed(2),
            horizontalFromEdge: a.mountingType === 'dring' ? 'left' : 'left',
            equation: (a.mountingType === 'dring')
              ? `GridC=${gridC.toString()}; Offset=${offset.toFixed(2)}; `
                + `Nail = ${round1(artC).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.mountingVerticalOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`
              : `GridC=${gridC.toString()}; Offset=${offset.toFixed(2)}; `
                + `Nail = ${round1(artC).toFixed(2)} + ${((a.height||0)/2).toFixed(2)} - ${(a.wireOffset||0).toFixed(2)} + ${(a.hangerOffset||0).toFixed(2)} = ${round1(nh).toFixed(2)}${unitLabel}`,
        };

        if (a.mountingType === 'dring') {
          const left  = artLeftX + (a.mountingHorizontalOffset || 0);
          const right = artLeftX + (a.width || 0) - (a.mountingHorizontalOffset || 0);
          res.isDRing = true;
          res.horizontalDistance  = round1(left).toFixed(2);
          res.horizontalDistance2 = round1(right).toFixed(2);
          res.horizontalEquation =
            `GridStart = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 = ${round1(startX).toFixed(2)}${unitLabel}; ` +
            `Left = ${round1(startX).toFixed(2)} + ${widthToLeft.toFixed(2)} + ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(left).toFixed(2)}${unitLabel}; ` +
            `Right = ${round1(startX).toFixed(2)} + ${widthToLeft.toFixed(2)} + ${(a.width||0).toFixed(2)} - ${(a.mountingHorizontalOffset||0).toFixed(2)} = ${round1(right).toFixed(2)}${unitLabel}`;
        } else {
          res.isDRing = false;
          res.horizontalDistance = round1(artCenterX).toFixed(2);
          res.horizontalEquation =
            `GridStart = (${(wallWidth||0).toFixed(2)} - ${totalW.toFixed(2)})/2 = ${round1(startX).toFixed(2)}${unitLabel}; ` +
            `Center = ${round1(startX).toFixed(2)} + ${widthToLeft.toFixed(2)} + ${((a.width||0)/2).toFixed(2)} = ${round1(artCenterX).toFixed(2)}${unitLabel}`;
        }

        results.push(res);
      }
    }
    return results;
  }

  function calculateNailPosition() {
    if (artworks.length === 0) return [];
    if (configuration === 'single')     return calcSingle();
    if (configuration === 'vertical')   return calcVertical();
    if (configuration === 'horizontal') return calcHorizontal();
    return calcCustom();
  }

  const results = calculateNailPosition();
  const firstResult = results.length ? results[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 text-blue-600"><IconCalc className="w-8 h-8" /></div>
            <h1 className="text-3xl font-bold text-gray-800">Art Hanging Calculator</h1>
            <button
              onClick={toggleUnits}
              className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {units === 'inches' ? '🇺🇸 Switch to cm' : '📏 Switch to inches'}
            </button>
          </div>

          <p className="text-gray-600 mb-8">
            Calculate precise nail placement for artwork with a {targetCentroid}{unitLabel} centroid height (museum standard).
          </p>

          {/* Target Centroid */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Centroid Height ({unitLabel} from floor)
            </label>
            <input
              type="number"
              step={units === 'cm' ? '0.1' : '0.01'}
              value={targetCentroid}
              onChange={(e) => setTargetCentroid(toNumberOrZero(e.target.value))}
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Wall Width */}
          <div className="mb-8 p-4 bg-amber-50 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wall Width ({unitLabel})
            </label>
            <input
              type="number"
              step={units === 'cm' ? '0.1' : '0.01'}
              value={wallWidth}
              onChange={(e) => setWallWidth(toNumberOrZero(e.target.value))}
              className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Used to compute horizontal distances from the left edge or center of the wall.
            </p>
          </div>

          {/* Configuration */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Configuration Type
            </label>
            <div className="grid grid-col-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {['single','vertical','horizontal','custom'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setConfiguration(type);
                    setArtworks(prev => {
                      if (type === 'single' && prev.length > 1) return [prev[0]];
                      if (type !== 'single' && prev.length === 1) {
                        return prev.concat({
                          id: Date.now(),
                          width: 0, height: 0,
                          mountingType: 'wire',
                          wireOffset: 0,
                          mountingVerticalOffset: 0,
                          mountingHorizontalOffset: 0,
                          hangerOffset: 2.54,
                        });
                      }
                      return prev;
                    });
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    configuration === type ? 'bg-blue-600 text-white shadow-lg'
                                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type[0].toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Grid Settings */}
          {configuration === 'custom' && (
            <div className="mb-8 p-6 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Grid Layout</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rows</label>
                  <input
                    type="number" min="1" value={layout.rows}
                    onChange={(e) => setLayout({ ...layout, y: undefined, rows: Math.max(1, toNumberOrZero(e.target.value)) })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
                  <input
                    type="number" min="1" value={layout.cols}
                    onChange={(e) => setLayout({ ...layout, cols: Math.max(1, toNumberOrZero(e.target.value)) })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">H-Gap ({unitLabel})</label>
                  <input
                    type="number" step={units === 'cm' ? '0.1' : '0.01'} value={layout.horizontalGap}
                    onChange={(e) => setLayout({ ...layout, horizontalGap: toNumberOrZero(e.target.value) })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">V-Gap ({unitLabel})</label>
                  <input
                    type="number" step={units === 'cm' ? '0.1' : '0.01'} value={layout.verticalGap}
                    onChange={(e) => setLayout({ ...layout, verticalGap: toNumberOrZero(e.target.value) })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stack gap */}
          {(configuration === 'vertical' || configuration === 'horizontal') && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gap Between Artworks ({unitLabel})
              </label>
              <input
                type="number" step={units === 'cm' ? '0.1' : '0.01'}
                value={configuration === 'vertical' ? layout.verticalGap : layout.horizontalGap}
                onChange={(e) => {
                  const v = toNumberOrZero(e.target.value);
                  setLayout(l => ({
                    ...l,
                    [configuration === 'vertical' ? 'verticalGap' : 'horizontalGap']: v,
                  }));
                }}
                className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
          )}

          {/* Artwork inputs */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Artwork Details</h2>
              {configuration !== 'single' && (
                <button
                  onClick={review => addArtwork()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                  Add Artwork
                </button>
              )}
            </div>

            <div className="space-y-4">
              {artworks.map((art, index) => (
                <div key={art.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">Artwork {index + 1}</h3>
                    {configuration !== 'single' && artworks.length > 1 && (
                      <button onClick={() => removeArtwork(art.id)} className="text-red-600 hover:text-red-700">
                        <IconTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Width ({unitLabel})</label>
                      <input
                        type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.width}
                        onChange={(e) => updateArtwork(art.id, 'width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Height ({unitLabel})</label>
                      <input
                        type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.height}
                        onChange={(e) => updateArtwork(art.id, 'height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mounting Type</label>
                      <select
                        value={art.mountingType}
                        onChange={(e) => updateArtwork(art.id, 'mountingType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="wire">Wire</option>
                        <option value="dring">D-Ring / Side Mounts (two nails)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    {art && art.mountingType === 'wire' ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Wire Offset ({unitLabel})</label>
                          <input
                            type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.wireOffset}
                            onChange={(e) => updateArtwork(art.id, 'wireOffset', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <p class="text-xs text-gray-500 mt-1">Distance from top of frame to taut wire.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hanger Offset ({unitLabel})</label>
                          <input
                            type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.hangerOffset}
                            onChange={(e) => updateArtwork(art.id, 'hangerOffset', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <p class="text-xs text-gray-500 mt-1">How much higher the nail sits above the taut wire.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Offset ({unitLabel})</label>
                          <input
                            type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.mountingVerticalOffset}
                            onChange={(e) => updateArtwork(art.id, 'mountingVerticalOffset', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <p class="text-xs text-gray-500 mt-1">Distance from top edge to D-ring hole/eye.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Horizontal Offset ({unitLabel})</label>
                          <input
                            type="number" step={units === 'cm' ? '0.1' : '0.01'} value={art.mountingHorizontalOffset}
                            onChange={(e) => updateArtwork(art.id, 'mountingHorizontalOffset', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <p class="text-xs text-gray-500 mt-1">Distance from side edge to each D-ring center.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Nail Placement Results</h2>
            <div className="space-y-4">
              {results.map((r, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-lg mb-1">
                        {r.position ? r.position : `Artwork ${r.artwork}`}
                      </p>
                      <p className="text-sm text-blue-100">
                        Centroid: {r.centroid}{unitLabel} from floor
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded p-3">
                        <p className="text-xs text-blue-100 mb-1">Vertical Position</p>
                        <p className="text-2xl font-bold">{r.nailHeight}{unitLabel} from floor</p>
                      </div>
                      <div className="bg-white/10 rounded p-3">
                        <p className="text-xs text-blue-100 mb-1">Horizontal Position</p>
                        {r.isDRing ? (
                          <div>
                            <p className="text-lg font-bold">Left: {r.horizontalDistance}{unitLabel} from left edge</p>
                            <p className="text-lg font-bold mt-1">Right: {r.horizontalDistance2}{unitLabel} from left edge</p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold">
                            {r.horizontalDistance}{unitLabel} from {r.horizontalFromEdge} edge
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {r.equation && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-blue-100 font-semibold mb-2">Vertical Calculation:</p>
                      <p className="text-xs font-mono text-white bg-black/20 rounded p-2 break-all">{r.meaning || r.equation}</p>
                      <p className="text-xs text-blue-100 font-semibold mb-2 mt-3">Horizontal Calculation:</p>
                      <p className="text-xs font-mono text-white bg-black/20 rounded p-2 break-all">{r.horizontalEquation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm">
                <strong>How to use:</strong>{' '}
                {firstResult && firstResult.isDRing
                  ? 'Mark the left and right distances from the left edge of the wall, then measure up to the nail height for both points.'
                  : firstResult && firstResult.horizontalFromEdge === 'center'
                    ? 'Measure to the center of your wall, mark the horizontal distance, then measure up to the nail height.'
                    : 'Measure from the left edge of your wall the shown horizontal distance, then measure up to the nail height.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Mount (React 18 UMD still supports legacy render) */
ReactDOM.render(<ArtHangingCalculator />, document.getElementById('root'));
