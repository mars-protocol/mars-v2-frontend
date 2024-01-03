import useSWR from 'swr'

import getICNS from 'api/wallets/getICNS'
import useChainConfig from 'hooks/useChainConfig'

export default function useICNSDomain(address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(`ICNS-${address}`, () => getICNS(chainConfig, address), {
    revalidateOnFocus: false,
  })
}
