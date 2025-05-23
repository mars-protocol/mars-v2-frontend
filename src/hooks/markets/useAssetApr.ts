import { useMemo } from 'react'
import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { fetchWithTimeout } from 'utils/fetch'
import { getUrl } from 'utils/url'
import { FETCH_TIMEOUT } from 'constants/query'

interface AprEntry {
  date: string
  value: string
}

interface AssetAprResponse {
  supply_apr: AprEntry[]
  borrow_apr: AprEntry[]
}

interface UseAssetAprParams {
  denom: string
  granularity?: string
  unit?: number
}

interface MergedChartData {
  date: string
  [key: string]: string | number | BigNumber
}

export default function useAssetApr({ denom, granularity = 'day', unit = 30 }: UseAssetAprParams) {
  const chainConfig = useChainConfig()
  const chain = chainConfig.id === 'neutron-1' ? 'neutron' : 'osmosis'
  const key = ['rb_asset_apr', chain, granularity, unit, denom]

  const fetcher = async (): Promise<AssetAprResponse> => {
    const baseUrl = 'https://backend.prod.mars-dev.net'
    const path = `/v2/rb_asset_apr?chain=${chain}&granularity=${granularity}&unit=${unit}&denom=${denom}`
    const url = getUrl(baseUrl, path)
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT)
    if (!res.ok) throw new Error('Failed to fetch APR data')
    const json = await res.json()
    return (json.data && json.data[0]) || { supply_apr: [], borrow_apr: [] }
  }

  const { data, error } = useSWR<AssetAprResponse>(key, fetcher, { revalidateOnFocus: false })

  const aprData: MergedChartData[] = useMemo(() => {
    if (!data) return []
    const borrowMap: Record<string, AprEntry> = Object.fromEntries(
      (data.borrow_apr || []).map((b) => [b.date, b]),
    )
    return (data.supply_apr || []).map((s) => ({
      date: s.date,
      supply_apr: parseFloat(s.value),
      borrow_apr: parseFloat(borrowMap[s.date]?.value || '0'),
    }))
  }, [data])

  return {
    data: aprData,
    isLoading: !data && !error,
    error,
  }
}
