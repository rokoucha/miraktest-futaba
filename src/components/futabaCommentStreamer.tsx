import React, { useEffect } from 'react'
import type { SetterOrUpdater } from 'recoil'
import type { Response } from '../lib/futaba/schema'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

const loggingName = 'Futaba Comment Streamer' as const

type FutabaCommentStreamerProps = {
  id: number
  restart: () => any
  result: () => string | undefined
  setDplayerComment: SetterOrUpdater<DPlayerCommentPayload> | null
  setZenzaComment: SetterOrUpdater<ZenzaCommentChat> | null
  stream: AsyncGenerator<Response, void, undefined>
}

export const FutabaCommentStreamer: React.VFC<FutabaCommentStreamerProps> = ({
  id,
  restart,
  result,
  setDplayerComment,
  setZenzaComment,
  stream,
}) => {
  useEffect(() => {
    console.info(loggingName, id, 'open')
    ;(async () => {
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
      } catch (e) {
        console.error(loggingName, id, e)

        stream.return()
      } finally {
        console.info(loggingName, id, 'closed by remote', result())

        restart()
      }
    })()

    return () => {
      console.info(loggingName, id, 'closed by provider', result())
      stream.return()

      restart()
    }
  })

  return <></>
}
