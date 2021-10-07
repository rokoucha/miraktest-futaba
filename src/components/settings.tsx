import React, { useState } from 'react'
import type { SetterOrUpdater } from 'recoil'
import { FETCH_INTERVAL_MS } from '../lib/futaba'
import type { Settings as TSettings } from '../atom'

const toNum = (n: string) => Number.parseInt(n, 10)

export type SettingsProps = {
  setSettings: SetterOrUpdater<TSettings>
  settings: TSettings
}

export const Settings: React.VFC<SettingsProps> = ({
  setSettings,
  settings,
}) => {
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
              <span>ポーリング間隔(ミリ秒)</span>
              <input
                min={FETCH_INTERVAL_MS}
                onChange={(e) => setInterval(toNum(e.target.value))}
                placeholder={String(FETCH_INTERVAL_MS)}
                type="number"
                value={interval ?? FETCH_INTERVAL_MS}
              />
            </label>
          </div>
          <div>
            <label>
              <span>最大ストリーム数</span>
              <input
                max="3"
                min="0"
                onChange={(e) => setMaxStreams(toNum(e.target.value))}
                placeholder="1"
                type="number"
                value={maxStreams ?? 1}
              />
            </label>
          </div>
        </div>
        <button type="submit">保存</button>
      </form>
    </>
  )
}
