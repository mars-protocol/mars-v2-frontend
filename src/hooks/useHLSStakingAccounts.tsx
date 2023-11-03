import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'

export default function useHLSStakingAccounts(address?: string) {
  return useSWR(`${address}/hlsStakingAccounts`, () => getHLSStakingAccounts(address), {
    fallbackData: [],
    suspense: true,
    revalidateOnFocus: false,
  })
}
