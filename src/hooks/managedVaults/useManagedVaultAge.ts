import { useMemo } from 'react'
import moment from 'moment'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'

export default function useManagedVaultAge(vaultAddress: string) {
  const { data: historicalDataAll } = useHistoricalVaultData(vaultAddress, 365)

  const vaultAge = useMemo(() => {
    if (!historicalDataAll || historicalDataAll.length === 0) return 0
    const firstDate = moment(historicalDataAll[0].date)
    const lastDate = moment(historicalDataAll[historicalDataAll.length - 1].date)
    return lastDate.diff(firstDate, 'days', false)
  }, [historicalDataAll])

  return vaultAge
}
