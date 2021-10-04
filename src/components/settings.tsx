import React, { useState } from 'react'
import type { SetterOrUpdater } from 'recoil'
import { FETCH_INTERVAL_MS } from '../lib/futaba'
import type { Settings as TSettings } from '../types/atom'

const toNum = (n: string) => Number.parseInt(n, 10)

export type SettingsProps = {
  setSettings: SetterOrUpdater<TSettings>
  settings: TSettings
}

export const Settings: React.VFC<SettingsProps> = ({
  setSettings,
  settings,
}) => {
  const minInterval = FETCH_INTERVAL_MS / 1000

  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [enabled, setEnabled] = useState(settings.enabled)
  const [interval, setInterval] = useState(settings.interval)
  const [keyword, setKeyword] = useState(settings.keyword)
  const [maxStreams, setMaxStreams] = useState(settings.maxStreams)

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSettings({ baseUrl, enabled, interval, keyword, maxStreams })
        }}
      >
        <div>
          <h2>基本設定</h2>
          <div>
            <label>
              <span>プラグインを有効にする</span>
              <input
                onChange={(e) => setEnabled(e.target.checked)}
                type="checkbox"
                checked={enabled ?? true}
              />
            </label>
          </div>
          <div>
            <label>
              <span>板のアドレス</span>
              <input
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com/futaba.htm"
                size={40}
                type="text"
                value={baseUrl ?? ''}
              />
            </label>
          </div>
          <div>
            <label>
              <span>検索条件</span>
              <input
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="^株スレ"
                type="text"
                value={keyword ?? ''}
              />
            </label>
          </div>
        </div>
        <div>
          <h2>上級者向け設定(分からないならいじるな)</h2>
          <div>
            <label>
              <span>ポーリング間隔(秒)</span>
              <input
                min={minInterval}
                onChange={(e) => setInterval(toNum(e.target.value))}
                placeholder={String(minInterval)}
                type="number"
                value={interval ?? minInterval}
              />
            </label>
          </div>
          <div>
            <label>
              <span>最大ストリーム数</span>
              <input
                max="5"
                onChange={(e) => setMaxStreams(toNum(e.target.value))}
                placeholder="3"
                type="number"
                value={maxStreams ?? 3}
              />
            </label>
          </div>
        </div>
        <button type="submit">保存</button>
      </form>
    </>
  )
}
