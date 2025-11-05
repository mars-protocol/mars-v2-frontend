import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import useChainConfig from 'hooks/chain/useChainConfig'
import { convertToChainAddress } from 'utils/wallet'

export default function useUrlAddress(): string | undefined {
  const { address: urlAddress } = useParams<{ address: string }>()
  const chainConfig = useChainConfig()

  const convertedAddress = useMemo(() => {
    if (!urlAddress) return undefined

    const chainPrefix = chainConfig.bech32Config.bech32PrefixAccAddr
    const converted = convertToChainAddress(urlAddress, chainPrefix)

    return converted || undefined
  }, [urlAddress, chainConfig.bech32Config.bech32PrefixAccAddr])

  return convertedAddress
}
