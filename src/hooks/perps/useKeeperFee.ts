import { defaultKeeperFeeAmount, getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function useKeeperFee() {
  const chainConfig = useChainConfig()
  const creditManagerConfig = useStore((s) => s.creditManagerConfig)

  const [keeperFee, setKeeperFee] = useLocalStorage(
    `${chainConfig.id}/${LocalStorageKeys.PERPS_KEEPER_FEE}`,
    creditManagerConfig?.keeper_fee_config?.min_fee ??
      getDefaultChainSettings(chainConfig).keeperFee,
  )

  const parsedKeeperFee = useMemo(() => {
    try {
      return typeof keeperFee === 'string' ? JSON.parse(keeperFee) : keeperFee
    } catch {
      return { denom: '', amount: '0' }
    }
  }, [keeperFee])

  const calculateKeeperFee = useMemo(
    () =>
      parsedKeeperFee?.amount
        ? BNCoin.fromDenomAndBigNumber(parsedKeeperFee.denom, BN(parsedKeeperFee.amount))
        : BNCoin.fromDenomAndBigNumber(chainConfig.stables[0], BN(defaultKeeperFeeAmount)),
    [chainConfig.stables, parsedKeeperFee.amount, parsedKeeperFee.denom],
  )

  return {
    keeperFee: parsedKeeperFee,
    setKeeperFee,
    calculateKeeperFee,
  }
}
