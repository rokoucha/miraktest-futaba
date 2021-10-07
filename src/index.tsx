import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Catalogue } from './components/catalogue'
import { catalogueWindowId, meta, prefix } from './constants'
import { FutabaCommentProvider } from './components/futabaCommentProvider'
import { RecoilState } from 'recoil'
import { Settings } from './components/settings'
import React, { useEffect } from 'react'
import type { Atom, InitPlugin } from './types/plugin'
import type { DPlayerCommentPayload } from './types/miraktest-dplayer'
import { settingsAtom } from './atom'
import type { ZenzaCommentChat } from './types/miraktest-zenza'

const main: InitPlugin = {
  renderer({ appInfo, packages, functions, atoms }) {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

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
          component() {
            const [settings, setSettings] = useRecoilState(settingsAtom)

            return <Settings setSettings={setSettings} settings={settings} />
          },
        },
        {
          id: `${prefix}.onPlayer`,
          position: 'onPlayer',
          component() {
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
      contextMenu: {
        label: 'カタログ@ふたば',
        click() {
          functions.openWindow({
            name: catalogueWindowId,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
      windows: {
        [catalogueWindowId]() {
          const program = useRecoilValue(atoms.contentPlayerProgramSelector)
          const service = useRecoilValue(atoms.contentPlayerServiceSelector)
          const settings = useRecoilValue(settingsAtom)

          useEffect(() => {
            remoteWindow.setTitle(`カタログ@ふたば - ${appInfo.name}`)

            const cookieJar = remote.session.defaultSession.cookies
            cookieJar.set({
              url: new URL(settings.baseUrl).origin,
              name: 'cxyl',
              value: '500x1x4x0x1',
            })
          }, [])

          return (
            <Catalogue
              program={program}
              service={service}
              settings={settings}
            />
          )
        },
      },
    }
  },
  main({ functions }) {
    return {
      ...meta,
      setup() {
        return
      },
      destroy() {
        return
      },
      appMenu: {
        label: 'カタログ@ふたば',
        click() {
          functions.openWindow({
            name: catalogueWindowId,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
    }
  },
}

export default main
