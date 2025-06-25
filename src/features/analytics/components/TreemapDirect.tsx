// @ts-nocheck
/**
 * Direct Treemap Component
 * Direct import without lazy loading
 * By Cheva
 */

import React from 'react'
const TreemapDirect = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Treemap Direct (No Lazy Loading)
      </h1>
      <div style={{ 
        backgroundColor: '#1f2937', 
        borderRadius: '8px', 
        padding: '24px',
        color: '#d1d5db'
      }}>
        <p>Esta página se carga directamente sin lazy loading.</p>
        <p style={{ marginTop: '8px' }}>Si puedes ver esto, el problema es con el lazy loading o las importaciones.</p>
        
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            Información de Debug:
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>URL: {window.location.pathname}</li>
            <li>Timestamp: {new Date().toLocaleString()}</li>
            <li>DOM Ready: {document.readyState}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
export default TreemapDirect