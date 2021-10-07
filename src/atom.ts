import { atom } from 'recoil'
import { prefix } from './constants'

export type Settings = {
  baseUrl: string
  enabled: boolean
  interval: number
  keyword: string
  maxStreams: number
}

export const settingsAtom = atom<Settings>({
  key: `${prefix}.settings`,
  default: {
    baseUrl: '',
    enabled: true,
    interval: 5000,
    keyword: '',
    maxStreams: 1,
  },
})
