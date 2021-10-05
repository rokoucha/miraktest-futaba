import { FutabaClient, Response, Threads } from '../lib/futaba'
import { FutabaCommentStreamer } from './futabaCommentStreamer'
import { useReturnAsync } from '../utils'
import React, { useEffect, useRef, useState } from 'react'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { Service, Program } from '../types/plugin'
import type { SetterOrUpdater } from 'recoil'
import type { Settings } from '../types/atom'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

const loggingName = 'Futaba Comment Provider' as const

export type FutabaCommentProviderProps = {
  program: Program | null
  service: Service | null
  setDplayerComment: SetterOrUpdater<DPlayerCommentPayload> | null
  settings: Settings
  setZenzaComment: SetterOrUpdater<ZenzaCommentChat> | null
}

export const FutabaCommentProvider: React.VFC<FutabaCommentProviderProps> = ({
  program,
  service,
  setDplayerComment,
  settings,
  setZenzaComment,
}) => {
  useEffect(() => {
    console.info('Futaba Comment Provider')
  }, [])

  const futabaRef = useRef<FutabaClient | null>(null)
  const streamsRef = useRef<
    [AsyncGenerator<Response, void, undefined>, () => string | undefined][]
  >([])
  const [restart, setRestart] = useState(false)

  useEffect(() => {
    try {
      futabaRef.current = new FutabaClient({ baseUrl: settings.baseUrl })
    } catch (error) {
      console.error(loggingName, error)
    }
  }, [settings])

  useEffect(() => {
    streamsRef.current = []
  }, [restart])

  useEffect(() => {
    if (!futabaRef.current) return

    if (settings.baseUrl === '') {
      console.warn(loggingName, '板が設定されていません')
      return
    }

    if (settings.keyword === '') {
      console.warn(loggingName, '検索条件が設定されていません')
      return
    }

    if (!setZenzaComment && !setDplayerComment) {
      console.warn(loggingName, 'コメントレンダラーがありません')
      return
    }

    if (!service) {
      console.warn(loggingName, 'サービスが取得できていません')
      return
    }

    const futaba = futabaRef.current

    let streams: [
      AsyncGenerator<Response, void, undefined>,
      () => string | undefined,
    ][] = []

    ;(async () => {
      let threads
      while (threads === undefined) {
        console.log(loggingName, 'trying to fetch threads...')
        try {
          threads = await futaba.threads()
          break
        } catch (e) {
          console.error(loggingName, e)
        }
      }

      streams = threads.res
        .filter(
          (t) => t.res[0].comment.search(new RegExp(settings.keyword)) >= 0,
        )
        .sort((a, b) => b.res.length - a.res.length)
        .slice(0, settings.maxStreams)
        .map((t, i) => {
          console.info(loggingName, 'stream', i, t)
          return useReturnAsync(
            futaba.stream({
              interval: settings.interval * 1000,
              res: t.res[0].resId,
            }),
          )
        })

      console.info(loggingName, streams.length, 'streams ready')

      streamsRef.current = streams
    })()
  }, [program, service, settings, restart])

  return (
    <>
      {streamsRef.current.map(([stream, result], index) => (
        <FutabaCommentStreamer
          id={index}
          key={index}
          result={result}
          setDplayerComment={setDplayerComment}
          restart={() => setRestart((restart) => !restart)}
          setZenzaComment={setZenzaComment}
          stream={stream}
        />
      ))}
    </>
  )
}
