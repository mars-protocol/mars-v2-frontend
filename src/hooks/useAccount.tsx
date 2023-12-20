import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import useChainConfig from 'hooks/useChainConfig'

export default function useAccount(accountId?: string, suspense?: boolean) {
  const chainConfig = useChainConfig()

  return useSWR(`account${accountId}`, () => getAccount(chainConfig, accountId), {
    suspense: suspense,
    revalidateOnFocus: false,
  })
}
