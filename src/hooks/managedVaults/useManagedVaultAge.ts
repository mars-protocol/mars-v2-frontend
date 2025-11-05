import { useMemo } from 'react'
import dayjs from 'utils/dayjs'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'

export default function useManagedVaultAge(vaultAddress: string) {
  const { data: historicalDataAll } = useHistoricalVaultData(vaultAddress, 365)

  const vaultAge = useMemo(() => {
    if (!historicalDataAll || historicalDataAll.length === 0) return 0
    const firstDate = dayjs(historicalDataAll[0].date)
    const lastDate = dayjs(historicalDataAll[historicalDataAll.length - 1].date)
    return lastDate.diff(firstDate, 'days')
  }, [historicalDataAll])

  return vaultAge
}
