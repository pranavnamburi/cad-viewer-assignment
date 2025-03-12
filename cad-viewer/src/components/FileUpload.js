import React, { useState } from 'react';

function FileUpload({ onModelUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('model', file);
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      onModelUploaded(data.modelUrl);
      setLoading(false);
    } catch (err) {
      setError('Error uploading file');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="model">Upload 3D Model (STL or OBJ)</label>
          <input 
            type="file" 
            id="model" 
            onChange={handleFileChange} 
            accept=".stl,.obj"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading} className="upload-btn">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
