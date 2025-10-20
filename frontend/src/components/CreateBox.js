import React, { useState } from 'react';
import api from '../utils/api';
import ImageUpload from './ImageUpload';

function CreateBox({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    photo_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newBox = await api.createBox(formData);
      onCreated(newBox);
    } catch (error) {
      alert('Failed to create box');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUploaded = (url) => {
    setFormData({
      ...formData,
      photo_url: url,
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create New Box</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Box name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
          />
          
          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
          />
          
          <ImageUpload onUploaded={handleImageUploaded} />
          
          {formData.photo_url && (
            <img src={formData.photo_url} alt="Preview" style={styles.preview} />
          )}
          
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minHeight: '100px',
    resize: 'vertical',
  },
  preview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default CreateBox;