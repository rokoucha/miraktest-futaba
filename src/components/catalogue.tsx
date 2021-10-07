import { Card } from './card'
import { Container } from './container'
import { CatalogueThread, FutabaClient, Sort } from '../lib/futaba'
import { Header } from './header'
import { Radio } from './radio'
import React, { useEffect, useRef, useState } from 'react'
import type { Program, Service } from '../types/plugin'
import type { Settings } from '../atom'

const loggingName = 'Futaba Catalogue' as const

const sorts: { value: Sort | null; title: string }[] = [
  { value: null, title: 'カタログ' },
  { value: 1, title: '新順' },
  { value: 2, title: '古順' },
  { value: 3, title: '多順' },
  { value: 6, title: '勢順' },
  { value: 4, title: '少順' },
  { value: 8, title: 'そ順' },
  { value: 7, title: '見歴' },
  { value: 9, title: '履歴' },
]

export type CataloguesProps = {
  program: Program | null
  service: Service | null
  settings: Settings
}

export const Catalogue: React.VFC<CataloguesProps> = ({ settings }) => {
  useEffect(() => {
    console.info(loggingName)
  }, [])

  const [theards, setThreads] = useState<CatalogueThread[]>([])
  const [sort, setSort] = useState<Sort | null>(null)
  const [title, setTitle] = useState('ふたば')

  const futabaRef = useRef<FutabaClient | null>(null)

  useEffect(() => {
    try {
      futabaRef.current = new FutabaClient({ baseUrl: settings.baseUrl })
    } catch (error) {
      console.error(loggingName, error)
    }
  }, [settings])

  useEffect(() => {
    if (!futabaRef.current) return

    const futaba = futabaRef.current
    ;(async () => {
      const catalogue = await futaba.catalogue({
        guid: sort === 9 ? 'on' : undefined,
        sort: sort ?? undefined,
      })

      console.log(loggingName, catalogue)

      setThreads(catalogue.threads)
      if (catalogue.title) setTitle(catalogue.title)
    })()
  }, [sort, settings])

  return (
    <Container>
      <Header title={title} subtitle="カタログモード">
        <div>
          <span style={{ fontSize: '1.1rem', marginRight: '0.1rem' }}>[</span>
          <span
            style={{
              color: '#0000EE',
              textDecoration: 'underline',
            }}
          >
            プレイヤーに戻る
          </span>
          <span style={{ fontSize: '1.1rem', marginLeft: '0.1rem' }}>]</span>
        </div>
        {sorts.map(({ value, title }, i) => (
          <Radio
            key={i}
            name="sort"
            onChange={(e) =>
              setSort(
                e.target.value === ''
                  ? null
                  : (Number.parseInt(e.target.value, 10) as Sort),
              )
            }
            selected={sort === value}
            title={title}
            value={value === null ? '' : String(value)}
          />
        ))}
        <div style={{ marginLeft: '0.3rem' }}>
          <span
            style={{
              color: '#0000EE',
              textDecoration: 'underline',
            }}
          >
            設定
          </span>
        </div>
      </Header>
      <div
        style={{
          border: '1px solid',
          display: 'grid',
          gridAutoFlow: 'row',
          gridTemplateColumns: 'repeat(auto-fill, minmax(62px, 1fr))',
          justifyContent: 'center',
        }}
      >
        {theards.map((t, i) => (
          <Card
            alt={t.alt}
            comment={t.comment}
            count={t.count}
            key={i}
            res={t.res}
            selected={false}
            thumbnail={t.thumbnail}
          />
        ))}
      </div>
      <hr />
    </Container>
  )
}
