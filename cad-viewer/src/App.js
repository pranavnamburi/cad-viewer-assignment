import React, { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import FileUpload from './components/FileUpload';
import Controls from './components/Controls';
import './styles.css';

function App() {
  const [modelUrl, setModelUrl] = useState('');

  const handleModelUploaded = (url) => {
    setModelUrl(url);
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(`http://localhost:5000/api/export?modelUrl=${encodeURIComponent(modelUrl)}&format=${format}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exported_model.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting model:', error);
      alert('Failed to export model');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>3D CAD Viewer</h1>
      </header>
      <main>
        <div className="upload-section">
          <FileUpload onModelUploaded={handleModelUploaded} />
        </div>
        <div className="viewer-section">
          {modelUrl ? (
            <ModelViewer modelUrl={modelUrl} />
          ) : (
            <div className="placeholder">Upload a model to view it here</div>
          )}
        </div>
        <Controls onExport={modelUrl ? handleExport : null} />
      </main>
    </div>
  );
}

export default App;
