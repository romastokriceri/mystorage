import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSync } from '../hooks/useSync';
import BoxItem from './BoxItem';
import CreateBox from './CreateBox';

function BoxList() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchBoxes = async () => {
    try {
      const data = await api.getBoxes();
      setBoxes(data);
    } catch (error) {
      console.error('Failed to fetch boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Синхронізація кожні 5 хвилин
  useSync(fetchBoxes);

  const handleBoxCreated = (newBox) => {
    setBoxes([...boxes, newBox]);
    setShowCreate(false);
  };

  const handleBoxDeleted = (boxId) => {
    setBoxes(boxes.filter(box => box.id !== boxId));
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>My Boxes</h1>
        <button onClick={() => setShowCreate(true)} style={styles.addButton}>
          + Add Box
        </button>
      </div>

      {showCreate && (
        <CreateBox 
          onClose={() => setShowCreate(false)}
          onCreated={handleBoxCreated}
        />
      )}

      <div style={styles.grid}>
        {boxes.length === 0 ? (
          <p>No boxes yet. Create your first box!</p>
        ) : (
          boxes.map(box => (
            <BoxItem 
              key={box.id} 
              box={box}
              onDeleted={handleBoxDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
  },
};

export default BoxList;