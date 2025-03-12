import React, { useState } from 'react';

function Controls({ onExport }) {
  const [exportFormat, setExportFormat] = useState('obj');
  
  const handleExport = () => {
    if (onExport) {
      onExport(exportFormat);
    }
  };
  
  return (
    <div className="controls-container">
      <h3>Controls:</h3>
      <ul>
        <li>Left click + drag: Rotate model</li>
        <li>Right click + drag: Pan model</li>
        <li>Scroll: Zoom in/out</li>
      </ul>
      
      {onExport && (
        <div className="export-options">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            className="export-format-select"
          >
            <option value="obj">OBJ Format</option>
            <option value="stl">STL Format</option>
          </select>
          <button onClick={handleExport} className="export-btn">
            Export Model
          </button>
        </div>
      )}
    </div>
  );
}

export default Controls;
