const { useState } = React;

// Lucide React icons as inline SVG components
const Calculator = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<rect width="16" height="20" x="4" y="2" rx="2"/>
<line x1="8" x2="16" y1="6" y2="6"/>
<line x1="16" x2="16" y1="14" y2="14"/>
<path d="M16 10h.01"/>
<path d="M12 10h.01"/>
<path d="M8 10h.01"/>
<path d="M12 14h.01"/>
<path d="M8 14h.01"/>
<path d="M12 18h.01"/>
<path d="M8 18h.01"/>
</svg>
);

const Plus = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M5 12h14"/>
<path d="M12 5v14"/>
</svg>
);

const Trash2 = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M3 6h18"/>
<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
<line x1="10" x2="10" y1="11" y2="17"/>
<line x1="14" x2="14" y1="11" y2="17"/>
</svg>
);

const ArtHangingCalculator = () => {
const [units, setUnits] = useState(‘cm’);
const [targetCentroid, setTargetCentroid] = useState(152.4);
const [wallWidth, setWallWidth] = useState(0);
const [configuration, setConfiguration] = useState(‘single’);
const [artworks, setArtworks] = useState([
{ id: 1, width: 0, height: 0, wireOffset: 0, mountingType: ‘wire’, mountingVerticalOffset: 0, mountingHorizontalOffset: 0, hangerOffset: 2.54 }
]);
const [layout, setLayout] = useState({
rows: 1,
cols: 1,
horizontalGap: 10,
verticalGap: 10
});

const unitLabel = units === ‘cm’ ? ‘cm’ : ‘in’;

const toggleUnits = () => {
const newUnits = units === ‘inches’ ? ‘cm’ : ‘inches’;
const conversionFactor = newUnits === ‘cm’ ? 2.54 : 1 / 2.54;

```
setUnits(newUnits);
setTargetCentroid(prev => +(prev * conversionFactor).toFixed(1));
setWallWidth(prev => prev === 0 ? 0 : +(prev * conversionFactor).toFixed(1));
setArtworks(prev => prev.map(art => ({
  ...art,
  width: art.width === 0 ? 0 : +(art.width * conversionFactor).toFixed(1),
  height: art.height === 0 ? 0 : +(art.height * conversionFactor).toFixed(1),
  wireOffset: art.wireOffset === 0 ? 0 : +(art.wireOffset * conversionFactor).toFixed(1),
  mountingVerticalOffset: art.mountingVerticalOffset === 0 ? 0 : +(art.mountingVerticalOffset * conversionFactor).toFixed(1),
  mountingHorizontalOffset: art.mountingHorizontalOffset === 0 ? 0 : +(art.mountingHorizontalOffset * conversionFactor).toFixed(1),
  hangerOffset: art.hangerOffset === 0 ? 0 : +(art.hangerOffset * conversionFactor).toFixed(1)
})));
setLayout(prev => ({
  ...prev,
  horizontalGap: +(prev.horizontalGap * conversionFactor).toFixed(1),
  verticalGap: +(prev.verticalGap * conversionFactor).toFixed(1)
}));
```

};

const addArtwork = () => {
setArtworks([…artworks, {
id: Date.now(),
width: 0,
height: 0,
wireOffset: 0,
mountingType: ‘wire’,
mountingVerticalOffset: 0,
mountingHorizontalOffset: 0,
hangerOffset: 2.54
}]);
};

const removeArtwork = (id) => {
if (artworks.length > 1) {
setArtworks(artworks.filter(art => art.id !== id));
}
};

const updateArtwork = (id, field, value) => {
setArtworks(artworks.map(art =>
art.id === id ? { …art, [field]: value === ‘’ ? 0 : (field === ‘mountingType’ ? value : (parseFloat(value) || 0)) } : art
));
};

const calculateNailPosition = () => {
if (configuration === ‘single’) {
const art = artworks[0];
const artCentroid = art.height / 2;

```
  if (art.mountingType === 'dring') {
    const mountingPointHeight = art.height - (art.mountingVerticalOffset || 0);
    const nailHeight = targetCentroid + artCentroid - mountingPointHeight + (art.hangerOffset || 0);
    const horizontalCenter = wallWidth / 2;
    const leftNailX = horizontalCenter - (art.width / 2) + (art.mountingHorizontalOffset || 0);
    const rightNailX = horizontalCenter + (art.width / 2) - (art.mountingHorizontalOffset || 0);
    
    return [{
      artwork: 1,
      nailHeight: nailHeight.toFixed(2),
      centroid: targetCentroid.toFixed(2),
      horizontalDistance: leftNailX.toFixed(2),
      horizontalDistance2: rightNailX.toFixed(2),
      horizontalFromEdge: 'left',
      isDRing: true,
      equation: `Mounting Point Height = ${art.height.toFixed(2)} - ${(art.mountingVerticalOffset || 0).toFixed(2)} = ${mountingPointHeight.toFixed(2)}; Nail Height = ${targetCentroid.toFixed(2)} + (${art.height.toFixed(2)} / 2) - ${mountingPointHeight.toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
      horizontalEquation: `Wall Center = ${wallWidth.toFixed(2)} / 2 = ${horizontalCenter.toFixed(2)}; Left Nail = ${horizontalCenter.toFixed(2)} - ${(art.width / 2).toFixed(2)} + ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${leftNailX.toFixed(2)}; Right Nail = ${horizontalCenter.toFixed(2)} + ${(art.width / 2).toFixed(2)} - ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${rightNailX.toFixed(2)}${unitLabel}`
    }];
  } else {
    const nailHeight = targetCentroid + artCentroid - art.wireOffset + (art.hangerOffset || 0);
    const horizontalCenter = wallWidth / 2;
    
    return [{
      artwork: 1,
      nailHeight: nailHeight.toFixed(2),
      centroid: targetCentroid.toFixed(2),
      horizontalDistance: horizontalCenter.toFixed(2),
      horizontalFromEdge: 'center',
      isDRing: false,
      equation: `Nail Height = ${targetCentroid.toFixed(2)} + (${art.height.toFixed(2)} / 2) - ${art.wireOffset.toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
      horizontalEquation: `Horizontal = ${wallWidth.toFixed(2)} / 2 = ${horizontalCenter.toFixed(2)}${unitLabel}`
    }];
  }
}

if (configuration === 'custom') {
  const { rows, cols, horizontalGap, verticalGap } = layout;
  const results = [];
  
  const colWidths = [];
  for (let c = 0; c < cols; c++) {
    const colArtworks = artworks.filter((_, i) => i % cols === c && i < rows * cols);
    if (colArtworks.length > 0) {
      const maxWidth = Math.max(...colArtworks.map(a => a.width || 0));
      colWidths.push(maxWidth);
    }
  }
  const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) + (cols - 1) * (horizontalGap || 0);
  const gridStartX = (wallWidth - totalWidth) / 2;
  
  let artIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (artIndex >= artworks.length) break;
      
      const art = artworks[artIndex];
      
      const totalHeight = artworks
        .filter((_, i) => Math.floor(i / cols) < rows)
        .reduce((sum, a, i) => {
          const r = Math.floor(i / cols);
          if (i % cols === 0) {
            return sum + (a.height || 0) + (r > 0 ? (verticalGap || 0) : 0);
          }
          return sum;
        }, 0);
      
      const rowHeights = [];
      for (let r = 0; r < rows; r++) {
        const rowStart = r * cols;
        const rowEnd = Math.min(rowStart + cols, artworks.length);
        if (rowStart < artworks.length) {
          const maxHeight = Math.max(...artworks.slice(rowStart, rowEnd).map(a => a.height || 0));
          rowHeights.push(maxHeight);
        }
      }
      
      const heightAbove = rowHeights.slice(0, row).reduce((s, h) => s + h, 0) + (row * (verticalGap || 0));
      const artCentroid = heightAbove + (art.height || 0) / 2;
      
      const gridCentroid = totalHeight / 2;
      const offset = targetCentroid - gridCentroid;
      
      const actualCentroid = artCentroid + offset;
      
      const widthToLeft = colWidths.slice(0, col).reduce((sum, w) => sum + w, 0) + (col * (horizontalGap || 0));
      const artCenterX = gridStartX + widthToLeft + (art.width || 0) / 2;
      
      if (art.mountingType === 'dring') {
        const mountingPointHeight = (art.height || 0) - (art.mountingVerticalOffset || 0);
        const nailHeight = actualCentroid + (art.height || 0) / 2 - mountingPointHeight + (art.hangerOffset || 0);
        const leftNailX = artCenterX - (art.width || 0) / 2 + (art.mountingHorizontalOffset || 0);
        const rightNailX = artCenterX + (art.width || 0) / 2 - (art.mountingHorizontalOffset || 0);
        
        results.push({
          artwork: artIndex + 1,
          position: `Row ${row + 1}, Col ${col + 1}`,
          nailHeight: nailHeight.toFixed(2),
          centroid: actualCentroid.toFixed(2),
          horizontalDistance: leftNailX.toFixed(2),
          horizontalDistance2: rightNailX.toFixed(2),
          horizontalFromEdge: 'left',
          isDRing: true,
          equation: `Grid offset = ${offset.toFixed(2)}; Art centroid = ${actualCentroid.toFixed(2)}; Mount height = ${mountingPointHeight.toFixed(2)}; Nail = ${actualCentroid.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} - ${mountingPointHeight.toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
          horizontalEquation: `Art center = ${artCenterX.toFixed(2)}; Left = ${artCenterX.toFixed(2)} - ${((art.width || 0) / 2).toFixed(2)} + ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${leftNailX.toFixed(2)}; Right = ${artCenterX.toFixed(2)} + ${((art.width || 0) / 2).toFixed(2)} - ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${rightNailX.toFixed(2)}${unitLabel}`
        });
      } else {
        const nailHeight = actualCentroid + (art.height || 0) / 2 - (art.wireOffset || 0) + (art.hangerOffset || 0);
        
        results.push({
          artwork: artIndex + 1,
          position: `Row ${row + 1}, Col ${col + 1}`,
          nailHeight: nailHeight.toFixed(2),
          centroid: actualCentroid.toFixed(2),
          horizontalDistance: artCenterX.toFixed(2),
          horizontalFromEdge: 'left',
          isDRing: false,
          equation: `Grid Centroid = ${gridCentroid.toFixed(2)}; Offset = ${targetCentroid.toFixed(2)} - ${gridCentroid.toFixed(2)} = ${offset.toFixed(2)}; Art Centroid = ${artCentroid.toFixed(2)} + ${offset.toFixed(2)} = ${actualCentroid.toFixed(2)}; Nail = ${actualCentroid.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} - ${(art.wireOffset || 0).toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
          horizontalEquation: `Grid Start = (${wallWidth.toFixed(2)} - ${totalWidth.toFixed(2)}) / 2 = ${gridStartX.toFixed(2)}; Art Center = ${gridStartX.toFixed(2)} + ${widthToLeft.toFixed(2)} + ${((art.width || 0) / 2).toFixed(2)} = ${artCenterX.toFixed(2)}${unitLabel}`
        });
      }
      
      artIndex++;
    }
  }
  return results;
}

if (configuration === 'vertical') {
  const totalHeight = artworks.reduce((sum, art, i) => sum + (art.height || 0) + (i > 0 ? (layout.verticalGap || 0) : 0), 0);
  const groupCentroid = totalHeight / 2;
  const offset = targetCentroid - groupCentroid;
  const horizontalCenter = wallWidth / 2;
  
  let cumulative = 0;
  return artworks.map((art, i) => {
    const artCentroid = cumulative + (art.height || 0) / 2 + offset;
    const prevCumulative = cumulative;
    cumulative += (art.height || 0) + (i < artworks.length - 1 ? (layout.verticalGap || 0) : 0);
    
    if (art.mountingType === 'dring') {
      const mountingPointHeight = (art.height || 0) - (art.mountingVerticalOffset || 0);
      const nailHeight = artCentroid + (art.height || 0) / 2 - mountingPointHeight + (art.hangerOffset || 0);
      const leftNailX = horizontalCenter - (art.width || 0) / 2 + (art.mountingHorizontalOffset || 0);
      const rightNailX = horizontalCenter + (art.width || 0) / 2 - (art.mountingHorizontalOffset || 0);
      
      return {
        artwork: i + 1,
        nailHeight: nailHeight.toFixed(2),
        centroid: artCentroid.toFixed(2),
        horizontalDistance: leftNailX.toFixed(2),
        horizontalDistance2: rightNailX.toFixed(2),
        horizontalFromEdge: 'left',
        isDRing: true,
        equation: `Group offset = ${offset.toFixed(2)}; Art centroid = ${artCentroid.toFixed(2)}; Mount height = ${mountingPointHeight.toFixed(2)}; Nail = ${artCentroid.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} - ${mountingPointHeight.toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
        horizontalEquation: `Center = ${horizontalCenter.toFixed(2)}; Left = ${horizontalCenter.toFixed(2)} - ${((art.width || 0) / 2).toFixed(2)} + ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${leftNailX.toFixed(2)}; Right = ${horizontalCenter.toFixed(2)} + ${((art.width || 0) / 2).toFixed(2)} - ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${rightNailX.toFixed(2)}${unitLabel}`
      };
    } else {
      const nailHeight = artCentroid + (art.height || 0) / 2 - (art.wireOffset || 0) + (art.hangerOffset || 0);
      
      return {
        artwork: i + 1,
        nailHeight: nailHeight.toFixed(2),
        centroid: artCentroid.toFixed(2),
        horizontalDistance: horizontalCenter.toFixed(2),
        horizontalFromEdge: 'center',
        isDRing: false,
        equation: `Group Centroid = ${groupCentroid.toFixed(2)}; Offset = ${targetCentroid.toFixed(2)} - ${groupCentroid.toFixed(2)} = ${offset.toFixed(2)}; Art Centroid = ${prevCumulative.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} + ${offset.toFixed(2)} = ${artCentroid.toFixed(2)}; Nail = ${artCentroid.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} - ${(art.wireOffset || 0).toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
        horizontalEquation: `Horizontal = ${wallWidth.toFixed(2)} / 2 = ${horizontalCenter.toFixed(2)}${unitLabel}`
      };
    }
  });
} else {
  const totalWidth = artworks.reduce((sum, art, i) => sum + (art.width || 0) + (i > 0 ? (layout.horizontalGap || 0) : 0), 0);
  const groupStartX = (wallWidth - totalWidth) / 2;
  
  let cumulative = 0;
  return artworks.map((art, i) => {
    const artCentroid = (art.height || 0) / 2;
    const artCenterX = groupStartX + cumulative + (art.width || 0) / 2;
    const prevCumulative = cumulative;
    cumulative += (art.width || 0) + (i < artworks.length - 1 ? (layout.horizontalGap || 0) : 0);
    
    if (art.mountingType === 'dring') {
      const mountingPointHeight = (art.height || 0) - (art.mountingVerticalOffset || 0);
      const nailHeight = targetCentroid + artCentroid - mountingPointHeight + (art.hangerOffset || 0);
      const leftNailX = artCenterX - (art.width || 0) / 2 + (art.mountingHorizontalOffset || 0);
      const rightNailX = artCenterX + (art.width || 0) / 2 - (art.mountingHorizontalOffset || 0);
      
      return {
        artwork: i + 1,
        nailHeight: nailHeight.toFixed(2),
        centroid: targetCentroid.toFixed(2),
        horizontalDistance: leftNailX.toFixed(2),
        horizontalDistance2: rightNailX.toFixed(2),
        horizontalFromEdge: 'left',
        isDRing: true,
        equation: `Mount height = ${mountingPointHeight.toFixed(2)}; Nail = ${targetCentroid.toFixed(2)} + ${((art.height || 0) / 2).toFixed(2)} - ${mountingPointHeight.toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
        horizontalEquation: `Group start = ${groupStartX.toFixed(2)}; Art center = ${artCenterX.toFixed(2)}; Left = ${artCenterX.toFixed(2)} - ${((art.width || 0) / 2).toFixed(2)} + ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${leftNailX.toFixed(2)}; Right = ${artCenterX.toFixed(2)} + ${((art.width || 0) / 2).toFixed(2)} - ${(art.mountingHorizontalOffset || 0).toFixed(2)} = ${rightNailX.toFixed(2)}${unitLabel}`
      };
    } else {
      const nailHeight = targetCentroid + artCentroid - (art.wireOffset || 0) + (art.hangerOffset || 0);
      
      return {
        artwork: i + 1,
        nailHeight: nailHeight.toFixed(2),
        centroid: targetCentroid.toFixed(2),
        horizontalDistance: artCenterX.toFixed(2),
        horizontalFromEdge: 'left',
        isDRing: false,
        equation: `Nail Height = ${targetCentroid.toFixed(2)} + (${(art.height || 0).toFixed(2)} / 2) - ${(art.wireOffset || 0).toFixed(2)} + ${(art.hangerOffset || 0).toFixed(2)} = ${nailHeight.toFixed(2)}${unitLabel}`,
        horizontalEquation: `Group Start = (${wallWidth.toFixed(2)} - ${totalWidth.toFixed(2)}) / 2 = ${groupStartX.toFixed(2)}; Art Center = ${groupStartX.toFixed(2)} + ${prevCumulative.toFixed(2)} + ${((art.width || 0) / 2).toFixed(2)} = ${artCenterX.toFixed(2)}${unitLabel}`
      };
    }
  });
}
```

};

const results = calculateNailPosition();

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
<div className="max-w-6xl mx-auto">
<div className="bg-white rounded-2xl shadow-xl p-8">
<div className="flex items-center gap-3 mb-6">
<div className="w-8 h-8 text-blue-600"><Calculator /></div>
<h1 className="text-3xl font-bold text-gray-800">Art Hanging Calculator</h1>
<button
onClick={toggleUnits}
className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
>
{units === ‘inches’ ? ‘🇺🇸 Switch to cm’ : ‘📏 Switch to inches’}
</button>
</div>

```
      <p className="text-gray-600 mb-8">
        Calculate precise nail placement for artwork with a {targetCentroid}{unitLabel} centroid height (museum standard).
      </p>

      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Target Centroid Height ({unitLabel} from floor)
        </label>
        <input
          type="number"
          step={units === 'cm' ? '0.1' : '0.01'}
          value={targetCentroid}
          onChange={(e) => setTargetCentroid(e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-8 p-4 bg-amber-50 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Wall Width ({unitLabel})
        </label>
        <input
          type="number"
          step={units === 'cm' ? '0.1' : '0.01'}
          value={wallWidth}
          onChange={(e) => setWallWidth(e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
          className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
        />
        <p className="text-sm text-gray-600 mt-2">
          Used to calculate horizontal placement and center your artwork on the wall
        </p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Configuration Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['single', 'vertical', 'horizontal', 'custom'].map(type => (
            <button
              key={type}
              onClick={() => {
                setConfiguration(type);
                if (type === 'single' && artworks.length > 1) {
                  setArtworks([artworks[0]]);
                } else if (type !== 'single' && artworks.length === 1) {
                  addArtwork();
                }
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                configuration === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {configuration === 'custom' && (
        <div className="mb-8 p-6 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Grid Layout</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rows</label>
              <input
                type="number"
                min="1"
                value={layout.rows}
                onChange={(e) => setLayout({...layout, rows: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
              <input
                type="number"
                min="1"
                value={layout.cols}
                onChange={(e) => setLayout({...layout, cols: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">H-Gap ({unitLabel})</label>
              <input
                type="number"
                step={units === 'cm' ? '0.1' : '0.01'}
                value={layout.horizontalGap}
                onChange={(e) => setLayout({...layout, horizontalGap: e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0)})}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">V-Gap ({unitLabel})</label>
              <input
                type="number"
                step={units === 'cm' ? '0.1' : '0.01'}
                value={layout.verticalGap}
                onChange={(e) => setLayout({...layout, verticalGap: e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0)})}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {(configuration === 'vertical' || configuration === 'horizontal') && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gap Between Artworks ({unitLabel})
          </label>
          <input
            type="number"
            step={units === 'cm' ? '0.1' : '0.01'}
            value={configuration === 'vertical' ? layout.verticalGap : layout.horizontalGap}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0);
              setLayout({
                ...layout,
                [configuration === 'vertical' ? 'verticalGap' : 'horizontalGap']: value
              });
            }}
            className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Artwork Dimensions</h2>
          {configuration !== 'single' && (
            <button
              onClick={addArtwork}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="w-4 h-4"><Plus /></div>
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
                  <button
                    onClick={() => removeArtwork(art.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <div className="w-4 h-4"><Trash2 /></div>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Width ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step={units === 'cm' ? '0.1' : '0.01'}
                    value={art.width}
                    onChange={(e) => updateArtwork(art.id, 'width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Height ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step={units === 'cm' ? '0.1' : '0.01'}
                    value={art.height}
                    onChange={(e) => updateArtwork(art.id, 'height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Mounting Type
                  </label>
                  <select
                    value={art.mountingType}
                    onChange={(e) => updateArtwork(art.id, 'mountingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="wire">Wire</option>
                    <option value="dring">D-Ring / Side Mounts</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {art.mountingType === 'wire' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Wire Offset ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step={units === 'cm' ? '0.1' : '0.01'}
                      value={art.wireOffset}
                      onChange={(e) => updateArtwork(art.id, 'wireOffset', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Distance from top to wire when taut</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Vertical Offset ({unitLabel})
                      </label>
                      <input
                        type="number"
                        step={units === 'cm' ? '0.1' : '0.01'}
                        value={art.mountingVerticalOffset}
                        onChange={(e) => updateArtwork(art.id, 'mountingVerticalOffset', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Distance from top edge to mount</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Horizontal Offset ({unitLabel})
                      </label>
                      <input
                        type="number"
                        step={units === 'cm' ? '0.1' : '0.01'}
                        value={art.mountingHorizontalOffset}
                        onChange={(e) => updateArtwork(art.id, 'mountingHorizontalOffset', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Distance from side edge to mount</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hanger Offset ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step={units === 'cm' ? '0.1' : '0.01'}
                    value={art.hangerOffset}
                    onChange={(e) => updateArtwork(art.id, 'hangerOffset', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Distance nail is above wire rest point</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Nail Placement Results</h2>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-lg mb-1">
                    {result.position ? result.position : `Artwork ${result.artwork}`}
                  </p>
                  <p className="text-sm text-blue-100">Centroid: {result.centroid}{unitLabel} from floor</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/10 rounded p-3">
                    <p className="text-xs text-blue-100 mb-1">Vertical Position</p>
                    <p className="text-2xl font-bold">{result.nailHeight}{unitLabel} from floor</p>
                  </div>
                  <div className="bg-white/10 rounded p-3">
                    <p className="text-xs text-blue-100 mb-1">Horizontal Position</p>
                    {result.isDRing ? (
                      <div>
                        <p className="text-lg font-bold">
                          Left: {result.horizontalDistance}{unitLabel} from left edge
                        </p>
                        <p className="text-lg font-bold mt-1">
                          Right: {result.horizontalDistance2}{unitLabel} from left edge
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold">
                        {result.horizontalDistance}{unitLabel} from {result.horizontalFromEdge} edge
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {result.equation && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs font-semibold text-blue-100 mb-2">Vertical Calculation:</p>
                  <p className="text-xs font-mono text-white bg-black/20 rounded p-2 break-all">
                    {result.equation}
                  </p>
                  <p className="text-xs font-semibold text-blue-100 mb-2 mt-3">Horizontal Calculation:</p>
                  <p className="text-xs font-mono text-white bg-black/20 rounded p-2 break-all">
                    {result.horizontalEquation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm">
            <strong>How to use:</strong> Measure {results[0]?.horizontalFromEdge === 'center' ? 'to the center of your wall' : 'from the left edge of your wall'} and mark the horizontal distance. 
            Then measure up from the floor to mark the vertical nail height. 
            The wire offset is the distance from the top of the frame to where the wire sits when pulled taut.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
};

ReactDOM.render(<ArtHangingCalculator />, document.getElementById(‘root’));
