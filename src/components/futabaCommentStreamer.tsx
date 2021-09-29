import React, { useEffect } from 'react'
import type { SetterOrUpdater } from 'recoil'
import type { Response } from '../lib/futaba/schema'
import type { DPlayerCommentPayload } from '../types/miraktest-dplayer'
import type { ZenzaCommentChat } from '../types/miraktest-zenza'

type FutabaCommentStreamerProps = {
  id: number
  setDplayerComment: SetterOrUpdater<DPlayerCommentPayload> | null
  setZenzaComment: SetterOrUpdater<ZenzaCommentChat> | null
  stream: AsyncGenerator<Response, void, undefined>
}

export const FutabaCommentStreamer: React.VFC<FutabaCommentStreamerProps> = ({
  id,
  setDplayerComment,
  setZenzaComment,
  stream,
}) => {
  useEffect(() => {
    console.info('Futaba Comment Streamer', id)
    ;(async () => {
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
    })()

    return () => {
      stream.return()
    }
  })

  return <></>
}
