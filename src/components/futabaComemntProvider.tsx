import { FutabaClient, Response, Threads } from '../lib/futaba'
import { FutabaCommentStreamer } from './futabaCommentStreamer'
import { useReturnAsync } from '../utils'
import React, { useEffect, useRef } from 'react'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { Service, Program } from '../types/plugin'
import type { SetterOrUpdater } from 'recoil'
import type { Settings } from '../types/atom'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

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

  useEffect(() => {
    try {
      futabaRef.current = new FutabaClient({ baseUrl: settings.baseUrl })
    } catch (error) {
      console.warn('Futaba Comment Provider', error)
    }
  }, [settings])

  useEffect(() => {
    if (!futabaRef.current) return

    if (settings.baseUrl === '') {
      console.warn('板が設定されていません')
      return
    }

    if (settings.keyword === '') {
      console.warn('検索条件が設定されていません')
      return
    }

    if (!setZenzaComment && !setDplayerComment) {
      console.warn('コメントレンダラーがありません')
      return
    }

    if (!service) {
      console.warn('サービスが取得できていません')
      return
    }

    const futaba = futabaRef.current

    let streams: [
      AsyncGenerator<Response, void, undefined>,
      () => string | undefined,
    ][] = []

    ;(async () => {
      const threads = await futaba.threads()

      streams = threads.res
        .filter(
          (t) => t.res[0].comment.search(new RegExp(settings.keyword)) >= 0,
        )
        .sort((a, b) => b.res.length - a.res.length)
        .slice(0, settings.maxStreams)
        .map((t, i) => {
          console.info('Futaba Comment Provider', 'stream', i, t)
          return useReturnAsync(
            futaba.stream({
              interval: settings.interval * 1000,
              res: t.res[0].resId,
            }),
          )
        })

      console.info('Futaba Comment Provider', streams.length, 'streams')

      streamsRef.current = streams
    })()
  }, [program, service, settings])

  return (
    <>
      {streamsRef.current.map(([stream], index) => (
        <FutabaCommentStreamer
          id={index}
          key={index}
          setDplayerComment={setDplayerComment}
          setZenzaComment={setZenzaComment}
          stream={stream}
        />
      ))}
    </>
  )
}
