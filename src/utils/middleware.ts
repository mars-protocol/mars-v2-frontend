import { Middleware, SWRHook } from 'swr'

import useChainConfig from 'hooks/chain/useChainConfig'

export const debugSWR: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const chainConfig = useChainConfig()
  const extendedFetcher = async (...args: any[]) => {
    const startTime = Date.now()
    const res = await fetcher!(...args)
    process.env.NODE_ENV !== 'production' &&
      console.log(
        '⬇️ GET: ',
        key,
        ' in ',
        Date.now() - startTime,
        'ms',
        'endpoint:',
        chainConfig.endpoints.rpc,
        'data: ',
        res,
      )
    return res
  }
  // ...
  return useSWRNext(key, extendedFetcher, config)
}
