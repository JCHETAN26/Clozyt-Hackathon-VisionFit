// Data Preview Component for development
import React, { useState, useEffect } from 'react';

const DataPreview = ({ dataset, onClose }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  if (!dataset || dataset.length === 0) {
    return (
      <div className="data-preview-overlay">
        <div className="data-preview-modal">
          <div className="preview-header">
            <h3>No Data Available</h3>
            <button onClick={onClose}>✕</button>
          </div>
          <p>Dataset is still loading...</p>
        </div>
      </div>
    );
  }

  const sampleItem = dataset[0];
  const fields = Object.keys(sampleItem);

  return (
    <div className="data-preview-overlay">
      <div className="data-preview-modal">
        <div className="preview-header">
          <h3>📊 Dataset Preview ({dataset.length} products)</h3>
          <div className="view-controls">
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button 
              className={viewMode === 'sample' ? 'active' : ''}
              onClick={() => setViewMode('sample')}
            >
              Sample
            </button>
            <button 
              className={viewMode === 'schema' ? 'active' : ''}
              onClick={() => setViewMode('schema')}
            >
              Schema
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="preview-content">
          {viewMode === 'table' && (
            <div className="table-view">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Colors</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.slice(0, 20).map((item, index) => (
                    <tr key={index} onClick={() => setSelectedItem(item)}>
                      <td title={item.name}>{item.name?.substring(0, 30)}...</td>
                      <td>{item.brand}</td>
                      <td>{item.category}</td>
                      <td>${item.price}</td>
                      <td>{item.available_colors?.join(', ') || item.color}</td>
                      <td>{item.confidence_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'sample' && sampleItem && (
            <div className="sample-view">
              <h4>Sample Product Record:</h4>
              <pre>{JSON.stringify(sampleItem, null, 2)}</pre>
            </div>
          )}

          {viewMode === 'schema' && (
            <div className="schema-view">
              <h4>Dataset Schema ({fields.length} fields):</h4>
              <div className="field-list">
                {fields.map(field => {
                  const sampleValue = sampleItem[field];
                  const type = Array.isArray(sampleValue) ? 'array' : typeof sampleValue;
                  return (
                    <div key={field} className="field-item">
                      <span className="field-name">{field}</span>
                      <span className="field-type">{type}</span>
                      <span className="field-sample">
                        {Array.isArray(sampleValue) 
                          ? `[${sampleValue.length} items]` 
                          : sampleValue?.toString().substring(0, 50) || 'null'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedItem && (
          <div className="item-detail-overlay" onClick={() => setSelectedItem(null)}>
            <div className="item-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="item-detail-header">
                <h4>{selectedItem.name}</h4>
                <button onClick={() => setSelectedItem(null)}>✕</button>
              </div>
              <div className="item-detail-content">
                <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .data-preview-overlay {
          fixed: true;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .data-preview-modal {
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
        }

        .view-controls button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .view-controls button.active {
          background: #007bff;
          color: white;
        }

        .close-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          cursor: pointer;
        }

        .preview-content {
          flex: 1;
          overflow: auto;
          padding: 1rem;
        }

        .table-view table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-view th,
        .table-view td {
          border: 1px solid #ddd;
          padding: 0.5rem;
          text-align: left;
        }

        .table-view th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .table-view tbody tr:hover {
          background: #f8f9fa;
          cursor: pointer;
        }

        .sample-view pre,
        .schema-view pre,
        .item-detail-content pre {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          overflow: auto;
          font-size: 0.9rem;
        }

        .field-list {
          display: grid;
          gap: 0.5rem;
        }

        .field-item {
          display: grid;
          grid-template-columns: 200px 80px 1fr;
          gap: 1rem;
          padding: 0.5rem;
          border: 1px solid #eee;
          border-radius: 4px;
        }

        .field-name {
          font-weight: 600;
          color: #007bff;
        }

        .field-type {
          background: #e9ecef;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          text-align: center;
        }

        .field-sample {
          color: #666;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .item-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .item-detail-modal {
          background: white;
          border-radius: 12px;
          max-width: 80vw;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .item-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .item-detail-content {
          overflow: auto;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default DataPreview;