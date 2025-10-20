import React, { useRef, useState } from 'react';
import api from '../utils/api';

function ImageUpload({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      onUploaded(result.url);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={styles.button}
      >
        {uploading ? 'Uploading...' : '📷 Upload Photo'}
      </button>
    </div>
  );
}

const styles = {
  button: {
    padding: '12px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default ImageUpload;