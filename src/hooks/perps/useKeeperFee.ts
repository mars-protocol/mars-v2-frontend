import { useMemo } from 'react'

import { getDefaultChainSettings, getDefaultKeeperFee } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export interface ParsedKeeperFee {
  denom: string
  amount: string
}

export function useKeeperFee() {
  const chainConfig = useChainConfig()
  const creditManagerConfig = useStore((s) => s.creditManagerConfig)

  const [keeperFee, setKeeperFee] = useLocalStorage(
    `${chainConfig.id}/${LocalStorageKeys.PERPS_KEEPER_FEE}`,
    creditManagerConfig?.keeper_fee_config?.min_fee ??
      getDefaultChainSettings(chainConfig).keeperFee,
  )

  const parsedKeeperFee = useMemo((): ParsedKeeperFee | null => {
    try {
      return typeof keeperFee === 'string' ? JSON.parse(keeperFee) : keeperFee
    } catch {
      return keeperFee
    }
  }, [keeperFee])

  const calculateKeeperFee = useMemo(() => {
    const defaultKeeperFee = getDefaultKeeperFee(chainConfig)

    if (parsedKeeperFee?.amount && parsedKeeperFee?.denom) {
      return BNCoin.fromDenomAndBigNumber(parsedKeeperFee.denom, BN(parsedKeeperFee.amount))
    }

    return BNCoin.fromDenomAndBigNumber(defaultKeeperFee.denom, BN(defaultKeeperFee.amount))
  }, [chainConfig, parsedKeeperFee])

  return {
    keeperFee,
    setKeeperFee,
    parsedKeeperFee,
    calculateKeeperFee,
  }
}
