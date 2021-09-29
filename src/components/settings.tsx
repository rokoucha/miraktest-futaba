import React, { useState } from 'react'
import type { SetterOrUpdater } from 'recoil'
import type { Settings as TSettings } from '../types/atom'

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
  const [keyword, setKeyword] = useState(settings.keyword)

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSettings({ baseUrl, keyword, enabled })
        }}
      >
        <div>
          <label>
            <span>プラグインを有効にする</span>
            <input
              onChange={(e) => setEnabled(e.target.checked)}
              type="checkbox"
              checked={enabled}
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
              value={baseUrl}
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
              value={keyword}
            />
          </label>
        </div>
        <button type="submit">保存</button>
      </form>
    </>
  )
}
