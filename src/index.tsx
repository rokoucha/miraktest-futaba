import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { RecoilState } from 'recoil'
import { FutabaCommentProvider } from './components/futabaComemntProvider'
import { meta, prefix } from './constants'
import { Settings } from './components/settings'
import React from 'react'
import type { Atom, InitPlugin } from './types/plugin'
import type { DPlayerCommentPayload } from './types/miraktest-dplayer'
import type { Settings as TSettings } from './types/atom'
import type { ZenzaCommentChat } from './types/miraktest-zenza'

const main: InitPlugin = {
  renderer: ({ appInfo, packages, atoms }) => {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const settingsAtom = atom<TSettings>({
      key: `${prefix}.settings`,
      default: {
        baseUrl: '',
        enabled: true,
        interval: 5,
        keyword: '',
        maxStreams: 3,
      },
    })

    let zenzaCommentAtom: RecoilState<ZenzaCommentChat> | null = null
    let dplayerCommentAtom: RecoilState<DPlayerCommentPayload> | null = null

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          atom: settingsAtom,
          type: 'atom',
        },
      ],
      storedAtoms: [
        {
          atom: settingsAtom,
          type: 'atom',
        },
      ],
      setup({ plugins }) {
        const zenza = plugins.find(
          (plugin) => plugin.id === 'io.github.ci7lus.miraktest-plugins.zenza',
        )
        if (zenza) {
          const family = zenza.exposedAtoms.find(
            (atom): atom is Atom<ZenzaCommentChat> =>
              atom.type === 'atom' &&
              atom.atom.key === 'plugins.ci7lus.zenza.comment',
          )
          if (family) {
            zenzaCommentAtom = family.atom
          }
        }

        const dplayer = plugins.find(
          (plugin) =>
            plugin.id === 'io.github.ci7lus.miraktest-plugins.dplayer',
        )
        if (dplayer) {
          const family = dplayer.exposedAtoms.find(
            (atom): atom is Atom<DPlayerCommentPayload> =>
              atom.type === 'atom' &&
              atom.atom.key === 'plugins.ci7lus.dplayer.comment',
          )
          if (family) {
            dplayerCommentAtom = family.atom
          }
        }
      },
      components: [
        {
          id: `${prefix}.settings`,
          position: 'onSetting',
          label: meta.name,
          component: () => {
            const [settings, setSettings] = useRecoilState(settingsAtom)

            return <Settings setSettings={setSettings} settings={settings} />
          },
        },
        {
          id: `${prefix}.onPlayer`,
          position: 'onPlayer',
          component: () => {
            const program = useRecoilValue(atoms.contentPlayerProgramSelector)
            const service = useRecoilValue(atoms.contentPlayerServiceSelector)
            const settings = useRecoilValue(settingsAtom)

            const setDplayerComment = dplayerCommentAtom
              ? useSetRecoilState(dplayerCommentAtom)
              : null
            const setZenzaComment = zenzaCommentAtom
              ? useSetRecoilState(zenzaCommentAtom)
              : null

            return settings.enabled ? (
              <FutabaCommentProvider
                program={program}
                service={service}
                setDplayerComment={setDplayerComment}
                settings={settings}
                setZenzaComment={setZenzaComment}
              />
            ) : (
              <></>
            )
          },
        },
      ],
      destroy() {
        return
      },
      windows: {},
    }
  },
  main: () => {
    return {
      ...meta,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
    }
  },
}

export default main
