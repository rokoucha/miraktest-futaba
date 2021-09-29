import * as z from 'zod'
import { decode } from 'he'

export const responseSchema = z
  .object({
    now: z.string(),
    name: z.string(),
    email: z.string(),
    sub: z.string(),
    com: z.string(),
    ext: z.string(),
    w: z.number(),
    h: z.number(),
    tim: z.string(),
    fsize: z.number(),
    del: z.string(),
    host: z.string(),
    id: z.string(),
    rsc: z.number(),
    src: z.string(),
    thumb: z.string(),
  })
  .transform((r) => ({
    comment: decode(r.com),
    del: r.del === 'del',
    email: r.email,
    file: r.ext
      ? {
          extension: r.ext,
          filesize: r.fsize,
          height: r.h,
          src: r.src,
          thumbnail: r.thumb,
          width: r.w,
        }
      : null,
    host: r.host,
    id: r.id,
    name: r.name,
    now: r.now,
    resCount: r.rsc,
    resId: 0,
    time: new Date(Number.parseInt(r.tim, 10)),
    title: r.sub,
  }))
export type Response = z.infer<typeof responseSchema>

export const threadSchema = z
  .object({
    old: z.number(),
    dispname: z.number(),
    dispsod: z.number(),
    die: z.string(),
    dielong: z.string(),
    nowtime: z.number(),
    maxres: z.string(),
    res: z.optional(z.object({}).catchall(responseSchema)),
    sd: z.union([z.array(z.any()), z.object({}).catchall(z.string())]),
  })
  .transform((t) => {
    const dielong = new Date(t.dielong)

    return {
      die: t.die,
      dielong: dielong > new Date() ? dielong : dielong.getTime() / 1000,
      dispname: t.dispname === 1,
      dispod: t.dispsod === 1,
      maxres: t.maxres,
      nowtime: new Date(t.nowtime * 1000),
      old: t.old === 1,
      res: Object.entries(t.res ?? {}).map(
        ([k, v]): Response => ({
          ...v,
          resId: Number.parseInt(k, 10),
        }),
      ),
      soudane: Object.entries(t.sd).map(([k, v]) => ({
        count: Number.parseInt(v, 10),
        id: Number.parseInt(k, 10),
      })),
    }
  })
export type Thread = z.infer<typeof threadSchema>

export const threadsSchema = z
  .object({
    old: z.number(),
    dispname: z.number(),
    dispsod: z.number(),
    die: z.string(),
    dielong: z.string(),
    nowtime: z.number(),
    maxres: z.string(),
    res: z.optional(z.object({}).catchall(responseSchema)),
    sd: z.array(z.any()),
  })
  .transform((t) => {
    const dielong = new Date(t.dielong)

    return {
      die: t.die,
      dielong: dielong > new Date() ? dielong : dielong.getTime() / 1000,
      dispname: t.dispname === 1,
      dispod: t.dispsod === 1,
      maxres: t.maxres,
      nowtime: new Date(t.nowtime * 1000),
      old: t.old === 1,
      res: t.res
        ? Object.entries(t.res).map(
            ([k, v]): Thread => ({
              die: '',
              dielong: -1,
              dispname: false,
              dispod: false,
              maxres: '',
              nowtime: new Date(0),
              old: false,
              res: [{ ...v, resCount: 0, resId: Number.parseInt(k, 10) }],
              soudane: [],
            }),
          )
        : [],
      soudane: t.sd,
    }
  })
export type Threads = z.infer<typeof threadsSchema>
