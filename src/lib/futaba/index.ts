import { dirname, join } from 'path'
import { sleep } from '../../utils'
import { Threads, threadSchema, threadsSchema } from './schema'

export type { Response, Thread, Threads } from './schema'

export class FutabaClient {
  #baseUrl: string
  #decoder: TextDecoder
  #threads: Threads

  constructor({ baseUrl }: { baseUrl: string }) {
    if (!baseUrl.endsWith('futaba.htm')) {
      throw new Error('Invalid URL(板じゃない何か)')
    }

    const url = new URL(baseUrl)

    this.#baseUrl = join(url.origin, dirname(url.pathname))
    this.#decoder = new TextDecoder('Shift_JIS')
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

    const regex = new RegExp(
      /<a href="(.+\/(?:futaba|guro2-enter|enter|51enter)\.html?)" target="cont">(?:<[^>]+>)?([^<]+)(?:<[^>]+>)?<\/a>/g,
    )

    const res = await fetch(bbsmenuUrl.href)
    if (!res.ok) {
      throw new Error('Failed to fetch bbsmenu')
    }

    const decoder = new TextDecoder('Shift_JIS')

    const text = decoder.decode(await res.arrayBuffer())

    const matches = Array.from(text.matchAll(regex))

    return matches.map(([_, url, title]) => ({
      url: `${bbsmenuUrl.protocol}${url}`,
      title,
    }))
  }

  stats() {
    return {
      baseUrl: this.#baseUrl,
      threads: this.#threads.res.length,
    }
  }

  async threads() {
    const res = await fetch(join(this.#baseUrl, 'futaba.php?mode=json'))
    if (!res.ok) {
      throw new Error('Failed to fetch threads')
    }

    const text = await res.text()

    let threads
    try {
      threads = threadsSchema.parse(JSON.parse(text))
    } catch (_) {
      throw new Error(this.#decoder.decode(await res.arrayBuffer()))
    }

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

    const res = await fetch(
      join(this.#baseUrl, `futaba.php?mode=json&${query.toString()}`),
    )
    if (!res.ok) {
      throw new Error('Failed to fetch responses')
    }

    const text = await res.text()

    let thread
    try {
      thread = threadSchema.parse(JSON.parse(text))
    } catch (_) {
      throw new Error(this.#decoder.decode(await res.arrayBuffer()))
    }

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

  async *stream({ interval = 5000, res }: { interval?: number; res: number }) {
    if (interval < 5000) {
      throw new Error('Too fast(5000ミリ秒以上にしなさい)')
    }

    let thread = await this.responses({ res })

    let start = thread.res.slice(-1)[0].resId
    let streaming = thread.maxres === ''

    while (streaming) {
      await sleep(interval)

      thread = await this.responses({ res, start })
      start = thread.res.slice(-1)[0].resId
      streaming = thread.maxres === ''

      yield* thread.res.slice(1)
    }

    return thread.maxres
  }
}