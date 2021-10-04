import React, { useEffect } from 'react'
import type { SetterOrUpdater } from 'recoil'
import type { Response } from '../lib/futaba/schema'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

type FutabaCommentStreamerProps = {
  id: number
  setDplayerComment: SetterOrUpdater<DPlayerCommentPayload> | null
  setRestart: React.Dispatch<React.SetStateAction<boolean>>
  setZenzaComment: SetterOrUpdater<ZenzaCommentChat> | null
  stream: AsyncGenerator<Response, void, undefined>
}

export const FutabaCommentStreamer: React.VFC<FutabaCommentStreamerProps> = ({
  id,
  setDplayerComment,
  setRestart,
  setZenzaComment,
  stream,
}) => {
  useEffect(() => {
    console.info('Futaba Comment Streamer', id, 'open')
    ;(async () => {
      try {
        for await (const response of stream) {
          console.info('Futaba Comment Streamer', id, response.comment)

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
        console.error('Futaba Comment Streamer', id, e)
      } finally {
        console.info('Futaba Comment Streamer', id, 'closed by remote')
        stream.return()

        setRestart(true)
      }
    })()

    return () => {
      console.info('Futaba Comment Streamer', id, 'closed by provider')
      stream.return()

      setRestart(true)
    }
  })

  return <></>
}
