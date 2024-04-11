import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'

export default function useLiquidationPrice(liqPrice: number | null) {
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null)
  const [isUpdatingLiquidationPrice, setIsUpdatingLiquidationPrice] = useState(false)
  const debouncedSetLiqPrice = useMemo(
    () => debounce(setLiquidationPrice, 1000, { leading: false }),
    [],
  )

  useEffect(() => {
    setIsUpdatingLiquidationPrice(true)
    debouncedSetLiqPrice(liqPrice)
  }, [debouncedSetLiqPrice, liqPrice])

  useEffect(() => {
    setIsUpdatingLiquidationPrice(false)
  }, [liquidationPrice])

  return { liquidationPrice, isUpdatingLiquidationPrice }
}
