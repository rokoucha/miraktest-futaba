import { useEffect, useRef } from 'react'

export const sleep = (milisec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milisec))

// Thanks for @tosuke
export const useReturnAsync = <T, TReturn, TNext>(
  generator: AsyncGenerator<T, TReturn, TNext>,
): [AsyncGenerator<T, void, TNext>, () => TReturn | undefined] => {
  let result: TReturn | undefined

  return [
    (async function* () {
      result = yield* generator
    })(),
    () => result,
  ]
}

export const useRefFromState = <T>(i: T) => {
  const ref = useRef(i)
  useEffect(() => {
    ref.current = i
  }, [i])

  return ref
}
