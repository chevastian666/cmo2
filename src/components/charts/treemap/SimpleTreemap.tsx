/**
 * Simple Treemap Component
 * Minimal treemap without D3 for testing
 * By Cheva
 */

import React from 'react';
import { TreemapProps } from './types';

export const SimpleTreemap: React.FC<TreemapProps> = ({
  _data,
  width = 800,
  height = 600,
  className = ''
}) => {
  return (
    <div className={`treemap-container ${className}`}>
      <div 
        style={{ 
          width: width + 'px', 
          height: height + 'px', 
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af'
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{data.name}</h3>
          <p>Children: {data.children ? data.children.length : 0}</p>
        </div>
      </div>
    </div>
  );
};