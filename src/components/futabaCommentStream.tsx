import { sleep } from '../utils'
import React, { useEffect } from 'react'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { Response } from '../lib/futaba/schema'
import type { SetterOrUpdater } from 'recoil'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

const loggingName = 'Futaba Comment Streamer' as const

type FutabaCommentStreamerProps = {
  close: () => void
  delay: number
  id: number
  result: () => string | undefined
  setDplayerComment: SetterOrUpdater<DPlayerCommentPayload> | null
  setZenzaComment: SetterOrUpdater<ZenzaCommentChat> | null
  stream: AsyncGenerator<Response, void, undefined>
}

export const FutabaCommentStreamer: React.VFC<FutabaCommentStreamerProps> = ({
  close,
  delay,
  id,
  result,
  setDplayerComment,
  setZenzaComment,
  stream,
}) => {
  useEffect(() => {
    ;(async () => {
      await sleep(delay)

      console.info(loggingName, id, 'open', delay, 'ms')

      try {
        for await (const response of stream) {
          console.info(loggingName, id, response.comment)

          if (setZenzaComment) {
            setZenzaComment({
              content: response.comment,
              date_usec: response.time.getTime(),
              date: response.time.getTime() / 1000,
              mail: response.email,
              no: response.resId,
              user_id: response.name,
            })
          }

          if (setDplayerComment) {
            setDplayerComment({
              author: response.name,
              color: 'white',
              commands: [],
              no: response.resId,
              source: 'futaba',
              sourceUrl: null,
              text: response.comment,
              time: response.time.getTime() / 1000,
              timeMs: response.time.getTime(),
              type: 'right',
            })
          }
        }

        console.info(loggingName, id, 'closed by client', result())
      } catch (e) {
        console.error(loggingName, id, 'closed by error', e)
      } finally {
        close()
      }
    })()

    return () => {
      console.info(loggingName, id, 'closed by provider', result())
      close()
    }
  })

  return <></>
}
