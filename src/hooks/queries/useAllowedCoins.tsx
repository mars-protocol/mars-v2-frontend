import { useQuery } from '@tanstack/react-query'

import { ENV } from 'constants/env'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'

type Result = string[]

const queryMsg = {
  allowed_coins: {},
}

export const useAllowedCoins = () => {
  const client = useStore((s) => s.signingClient)
  const creditManagerAddress = ENV.ADDRESS_CREDIT_MANAGER

  const result = useQuery<Result>(
    queryKeys.allowedCoins(),
    async () => client?.queryContractSmart(creditManagerAddress || '', queryMsg),
    {
      enabled: !!client,
      staleTime: Infinity,
    },
  )

  return {
    ...result,
    data: result?.data,
  }
}
