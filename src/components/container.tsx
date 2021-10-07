import React from 'react'

export const Container: React.FC = ({ children }) => (
  <div
    style={{
      backgroundColor: '#FFFFEE',
      color: '#800000',
      fontFamily: 'sans-serif',
      padding: '8px',
    }}
  >
    {children}
  </div>
)
