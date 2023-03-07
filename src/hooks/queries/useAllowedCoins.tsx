import { useQuery } from '@tanstack/react-query'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'

type Result = string[]

const queryMsg = {
  allowed_coins: {},
}

export const useAllowedCoins = () => {
  if (!ENV.ADDRESS_CREDIT_MANAGER) {
    console.error(ENV_MISSING_MESSAGE)
    return null
  }

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
