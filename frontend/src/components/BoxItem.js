import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function BoxItem({ box, onDeleted }) {
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this box?')) {
      try {
        await api.deleteBox(box.id);
        onDeleted(box.id);
      } catch (error) {
        alert('Failed to delete box');
      }
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await api.shareBox(box.id, shareEmail);
      alert('Box shared successfully!');
      setShowShare(false);
      setShareEmail('');
    } catch (error) {
      alert(error.message || 'Failed to share box');
    }
  };

  return (
    <div style={styles.card}>
      {box.photo_url && (
        <img src={box.photo_url} alt={box.name} style={styles.image} />
      )}
      
      <div style={styles.content}>
        <h3>{box.name}</h3>
        {box.description && <p style={styles.description}>{box.description}</p>}
        {box.location && <p style={styles.location}>📍 {box.location}</p>}
        {box.qr_code && <p style={styles.qr}>QR: {box.qr_code}</p>}
        {box.is_shared && <span style={styles.badge}>Shared with you</span>}
        
        <div style={styles.stats}>
          <span>{box.items?.length || 0} items</span>
        </div>
        
        <div style={styles.actions}>
          <button 
            onClick={() => navigate(`/box/${box.id}`)}
            style={styles.viewButton}
          >
            View Items
          </button>
          
          {!box.is_shared && (
            <>
              <button 
                onClick={() => setShowShare(!showShare)}
                style={styles.shareButton}
              >
                Share
              </button>
              <button 
                onClick={handleDelete}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </>
          )}
        </div>
        
        {showShare && (
          <form onSubmit={handleShare} style={styles.shareForm}>
            <input
              type="email"
              placeholder="User email to share with"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>Share</button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  content: {
    padding: '20px',
  },
  description: {
    color: '#666',
    fontSize: '14px',
    marginTop: '10px',
  },
  location: {
    fontSize: '14px',
    color: '#007bff',
    marginTop: '5px',
  },
  qr: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#17a2b8',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    marginTop: '10px',
  },
  stats: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
    fontSize: '14px',
    color: '#666',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  viewButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  shareButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  shareForm: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default BoxItem;