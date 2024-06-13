import useChainConfig from 'hooks/chain/useChainConfig'
import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'

export default function useEstimatedFee(estimateFeeTx: ExecutableTx | undefined) {
  const chainConfig = useChainConfig()
  const [estimatedFee, setEstimatedFee] = useState<StdFee>({
    amount: [
      {
        denom: chainConfig.defaultCurrency.coinDenom,
        amount: '0',
      },
    ],
    gas: '0',
  })
  const [isUpdatingEstimatedFee, setIsUpdatingEstimatedFee] = useState(false)
  const debouncedSetEstimatedFee = useMemo(
    () =>
      debounce((estimateFeeTx) => estimateFeeTx?.estimateFee().then(setEstimatedFee), 1000, {
        leading: false,
      }),
    [],
  )

  useEffect(() => {
    if (isUpdatingEstimatedFee) return
    debouncedSetEstimatedFee(estimateFeeTx)
    setIsUpdatingEstimatedFee(true)
  }, [debouncedSetEstimatedFee, estimateFeeTx])

  useEffect(() => {
    if (estimatedFee.amount[0].amount !== '0') setIsUpdatingEstimatedFee(false)
  }, [estimatedFee])

  return { estimatedFee, isUpdatingEstimatedFee }
}
