import { decode } from 'he'
import { dirname, join } from 'path'
import { sleep } from '../../utils'
import { Threads, threadSchema, threadsSchema } from './schema'

export const FETCH_INTERVAL_MS = 3000 as const
export const RETRY_MAX = 5 as const

export type { Response, Thread, Threads } from './schema'

export type Sort = 1 | 2 | 3 | 6 | 4 | 8 | 7 | 9

export type CatalogueThread = {
  alt: string
  comment: string
  count: number
  res: number
  thumbnail?: string
}

export class FutabaClient {
  #baseUrl: string
  #decoder: TextDecoder
  #fetchedAt: Date
  #threads: Threads

  constructor({ baseUrl }: { baseUrl: string }) {
    if (!baseUrl.endsWith('futaba.htm')) {
      throw new Error('Invalid URL(板じゃない何か)')
    }

    const url = new URL(baseUrl)

    this.#baseUrl = join(url.origin, dirname(url.pathname))
    this.#decoder = new TextDecoder('Shift_JIS')
    this.#fetchedAt = new Date(0)
    this.#threads = {
      die: '',
      dielong: -2,
      dispname: false,
      dispod: false,
      maxres: '',
      nowtime: new Date(0),
      old: false,
      res: [],
      soudane: [],
    }
  }

  static async getTextboards(bbsmenu = 'https://www.2chan.net/bbsmenu.html') {
    const bbsmenuUrl = new URL(bbsmenu)

    const regex =
      /<a href="(.+\/(?:futaba|guro2-enter|enter|51enter)\.html?)" target="cont">(?:<[^>]+>)?([^<]+)(?:<[^>]+>)?<\/a>/g

    const res = await fetch(bbsmenuUrl.href)
    if (!res.ok) {
      throw new Error('Failed to fetch bbsmenu')
    }

    const decoder = new TextDecoder('Shift_JIS')

    const text = decoder.decode(await res.arrayBuffer())

    const matches = Array.from(text.matchAll(regex))

    if (matches.length < 3) throw new Error(text)

    return matches.map(([_, url, title]) => ({
      url: `${bbsmenuUrl.protocol}${url}`,
      title,
    }))
  }

  get fetchedAt() {
    return this.#fetchedAt
  }

  set fetchedAt(value: Date) {
    this.#fetchedAt = value
  }

  stats() {
    return {
      baseUrl: this.#baseUrl,
      fetchedAt: this.#fetchedAt,
      threads: this.#threads.res.length,
    }
  }

  async #fetch(
    input: string,
    init?: RequestInit | undefined,
    retry = 0,
  ): Promise<Response> {
    const elapsedTime = new Date().getTime() - this.#fetchedAt.getTime()

    if (elapsedTime < FETCH_INTERVAL_MS) {
      const wait = FETCH_INTERVAL_MS * (retry === 0 ? 1 : retry) - elapsedTime

      console.log(
        'FutabaClient',
        'elapsed',
        elapsedTime,
        'ms,',
        'throttling',
        wait,
        'ms',
      )

      await sleep(wait)
    }

    const res = await fetch(join(this.#baseUrl, input), init)

    this.#fetchedAt = new Date()

    if (!res.headers.get('Content-Type')?.startsWith('application/json')) {
      const message = this.#decoder.decode(await res.clone().arrayBuffer())

      if (
        /操作が早すぎます あと2秒で再送できます/g.test(message) &&
        retry < RETRY_MAX
      ) {
        ++retry

        console.log('FutabaClient', 'retry', retry, '/', RETRY_MAX)

        return this.#fetch(input, init, retry)
      }
    }

    return res
  }

  async catalogue(params: { sort?: Sort; guid?: 'on' }) {
    if (params.sort === 9 && params.guid !== 'on') {
      throw new Error('guid must be set to "on"')
    }

    const query = new URLSearchParams()
    query.set('mode', 'cat')

    for (const [k, v] of Object.entries(params)) {
      query.set(k, String(v))
    }

    const res = await this.#fetch(`futaba.php?${query.toString()}`)
    if (!res.ok) {
      throw new Error('Failed to fetch catalogue')
    }

    const text = this.#decoder.decode(await res.arrayBuffer())

    const title = text.match(/<span id="tit">([^<]+)<\/span>/)
    if (!title) throw new Error('Failed to match title')

    const threadRegEx =
      /<td><a href='res\/(\d+)\.htm' target='_blank'>(?:<img src='(.+)' border=0 width=\d+ height=\d+ alt="(.*)" loading="lazy">|<small>(.*)<\/small>)?<\/a><br>(?:<small>(.+)<\/small><br>)?<font size=2>(\d+)<\/font><\/td>/g

    const threads = Array.from(text.matchAll(threadRegEx))

    if (threads.length < 7) throw new Error('Failed to match threads')

    return {
      threads: threads.map(
        ([
          _,
          res,
          thumbnail,
          alt,
          comment1,
          comment2,
          count,
        ]): CatalogueThread => ({
          alt: alt,
          comment: decode(comment1 !== undefined ? comment1 : comment2),
          count: Number.parseInt(count, 10),
          res: Number.parseInt(res, 10),
          thumbnail:
            thumbnail !== undefined
              ? new URL(thumbnail, this.#baseUrl).href
              : undefined,
        }),
      ),
      title: title[1],
    }
  }

  async threads() {
    const res = await this.#fetch('futaba.php?mode=json')
    if (!res.ok) {
      throw new Error('Failed to fetch threads')
    }

    const threads = threadsSchema.parse(await res.json())

    this.#threads = threads

    return threads
  }

  async responses(params: { res: number; start?: number; end?: number }) {
    if (
      params.res === 0 &&
      params.start === undefined &&
      params.end === undefined
    ) {
      throw new Error('Invalid parameters')
    }

    const query = new URLSearchParams()
    query.set('mode', 'json')

    for (const [k, v] of Object.entries(params)) {
      query.set(k, String(v))
    }

    const res = await this.#fetch(`futaba.php?mode=json&${query.toString()}`)
    if (!res.ok) {
      throw new Error('Failed to fetch responses')
    }

    const thread = threadSchema.parse(await res.json())

    let index = this.#threads.res.findIndex(
      (t) => t.res[0].resId === params.res,
    )
    if (index < 0 && params.res !== 0) {
      await this.responses({ res: 0, start: params.res, end: params.res })

      index = this.#threads.res.findIndex((t) => t.res[0].resId === params.res)
    }

    if (thread.res.length === 0) {
      this.#threads.res.splice(index, 1)

      throw new Error('Thread not found...(ファイルが無いよ)')
    }

    if (params.res === 0) {
      thread.res[0].resCount = 0

      this.#threads.res.push(thread)

      return thread
    }

    this.#threads.res[index].die = thread.die
    this.#threads.res[index].dielong = thread.dielong
    this.#threads.res[index].dispname = thread.dispname
    this.#threads.res[index].dispod = thread.dispod
    this.#threads.res[index].maxres = thread.maxres
    this.#threads.res[index].nowtime = thread.nowtime
    this.#threads.res[index].old = thread.old
    this.#threads.res[index].soudane = thread.soudane

    for (const res of thread.res) {
      if (this.#threads.res[index].res.some((r) => r.resId === res.resId)) {
        continue
      }

      this.#threads.res[index].res.push(res)
    }

    this.#threads.res[index].res.sort((a, b) => a.resCount - b.resCount)

    return thread
  }

  async *stream({
    close,
    id = 0,
    interval = FETCH_INTERVAL_MS,
    res,
  }: {
    close?: () => boolean
    id?: number
    interval?: number
    res: number
  }) {
    if (interval < FETCH_INTERVAL_MS) {
      throw new Error(`Too fast(${FETCH_INTERVAL_MS}ミリ秒以上にしなさい)`)
    }

    let thread = await this.responses({ res })

    let start = thread.res.slice(-1)[0].resId
    let streaming = thread.maxres === ''

    console.log('FutabaClient', 'connected', id)

    while (streaming) {
      if (close && close()) {
        thread.maxres = 'closed by signal'
        break
      }

      await sleep(interval)

      console.log('FutabaClient', 'streaming', res, id)

      thread = await this.responses({ res, start })
      start = thread.res.slice(-1)[0].resId
      streaming = thread.maxres === ''

      yield* thread.res.slice(1)
    }

    console.log('FutabaClient', 'disconnected', id)

    return thread.maxres
  }
}
