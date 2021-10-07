import React from 'react'

export type HeaderProps = { title: string; subtitle: string }
export const Header: React.FC<HeaderProps> = ({
  children,
  title,
  subtitle,
}) => (
  <>
    <h1
      style={{
        fontSize: '160%',
        fontWeight: 'bold',
        margin: '0',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {title}
    </h1>
    <hr
      style={{
        backgroundColor: '#808080',
        border: 'none',
        height: '1px',
        width: '90%',
      }}
    />
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
    <div style={{ backgroundColor: '#0040e0', width: '100%' }}>
      <h2 style={{ color: '#FFFFFF', textAlign: 'center', fontSize: '1rem' }}>
        {subtitle}
      </h2>
    </div>
  </>
)
