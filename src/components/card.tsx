import React from 'react'
import { CatalogueThread } from '../lib/futaba'

const height = '100px'
const width = '60px'

export type CardProps = CatalogueThread & {
  selected: boolean
}

export const Card: React.VFC<CardProps> = ({
  alt = '',
  comment,
  count,
  res,
  selected,
  thumbnail,
}) => (
  <div
    style={{
      border: selected ? '4px solid #660099' : '1px solid',
      boxSizing: 'border-box',
      height,
      margin: '1px',
      padding: '2px',
      width,
    }}
  >
    {thumbnail ? (
      <div style={{ cursor: 'pointer' }}>
        <img
          alt={alt}
          src={thumbnail}
          style={{
            maxHeight: `calc(${width} - 12px`,
            maxWidth: `calc(${width} - 12px`,
          }}
        />
      </div>
    ) : (
      <></>
    )}
    <div>
      <small>{comment}</small>
    </div>
    <div>
      <span>{count}</span>
    </div>
  </div>
)
