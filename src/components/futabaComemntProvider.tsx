import { FutabaClient, Response } from '../lib/futaba'
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
  const [streams, setStreams] = useState<
    {
      close: () => void
      id: number
      result: () => string | undefined
      stream: AsyncGenerator<Response, void, undefined>
    }[]
  >([])

  const closeRequest = (id: number): [() => boolean, () => void] => {
    let closing = false

    return [
      () => closing,
      () => {
        closing = true
        setStreams(streams.filter((s) => s.id !== id))

        console.info(
          loggingName,
          'closed by request',
          id,
          streams.map((s) => s.id),
        )
      },
    ]
  }

  useEffect(() => {
    try {
      futabaRef.current = new FutabaClient({ baseUrl: settings.baseUrl })
    } catch (error) {
      console.error(loggingName, error)
    }
  }, [settings])

  useEffect(() => {
    setStreams([])
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

    ;(async () => {
      if (streams.length > 0) {
        console.log(loggingName, 'reset streams')

        for (const { close } of streams) {
          close()
        }

        setStreams([])
      }

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

      setStreams(
        threads.res
          .filter(
            (t) => t.res[0].comment.search(new RegExp(settings.keyword)) >= 0,
          )
          .sort((a, b) => b.res.length - a.res.length)
          .slice(0, settings.maxStreams)
          .map((t, i, s) => {
            const id = new Date().getTime()
            console.info(loggingName, 'stream', i, 'as', id, t)

            const [close, closer] = closeRequest(id)

            const [stream, result] = useReturnAsync(
              futaba.stream({
                close,
                id,
                interval: settings.interval * s.length,
                res: t.res[0].resId,
              }),
            )

            return {
              close: closer,
              id,
              result,
              stream,
            }
          }),
      )

      console.info(loggingName, 'ready', streams.length, 'streams')
    })()
  }, [program, service, settings])

  return (
    <>
      {streams.map(({ id, stream, result, close }, index) => {
        console.info(loggingName, 'fork', id, 'stream')

        return (
          <FutabaCommentStreamer
            close={close}
            delay={settings.interval * index}
            id={id}
            key={index}
            result={result}
            setDplayerComment={setDplayerComment}
            setZenzaComment={setZenzaComment}
            stream={stream}
          />
        )
      })}
    </>
  )
}
