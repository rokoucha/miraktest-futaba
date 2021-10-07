import React from 'react'

export type RadioProps = {
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  selected: boolean
  title: string
  value: string
}

export const Radio: React.VFC<RadioProps> = ({
  name,
  onChange,
  selected,
  title,
  value,
}) => (
  <div style={{ marginLeft: '0.3rem' }}>
    <label>
      <input
        checked={selected}
        name={name}
        onChange={onChange}
        style={{ display: 'none' }}
        type="radio"
        value={value}
      />
      <span
        style={{
          color: '#0000EE',
          cursor: 'pointer',
          fontWeight: selected ? 'bold' : 'normal',
          textDecoration: 'underline',
        }}
      >
        {title}
      </span>
    </label>
  </div>
)
