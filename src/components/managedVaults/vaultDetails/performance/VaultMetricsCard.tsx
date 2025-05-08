import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'
import { useMemo } from 'react'
import useManagedVaultPnl from 'hooks/managedVaults/useManagedVaultPnl'
import moment from 'moment'

interface Props {
  vaultDetails: ManagedVaultsData
  vaultAddress: string
}

export default function VaultMetricsCard(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const { data: historicalData90d } = useHistoricalVaultData(vaultAddress, 90)
  const { data: historicalDataAll } = useHistoricalVaultData(vaultAddress, 'all')
  const { data: vaultPnl } = useManagedVaultPnl(vaultAddress)

  const calculateMaxDrawdown = (data: HistoricalVaultChartData[]) => {
    if (!data?.length) return 0

    // Find first non-zero price to start from
    const firstNonZeroIndex = data.findIndex((point) => point.sharePrice > 0)
    if (firstNonZeroIndex === -1) return 0
    let peak = data[firstNonZeroIndex].sharePrice
    let maxDrawdown = 0

    for (let i = firstNonZeroIndex + 1; i < data.length; i++) {
      const currentPrice = data[i].sharePrice
      if (currentPrice > peak) {
        peak = currentPrice
      } else {
        const drawdown = ((peak - currentPrice) / peak) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    return maxDrawdown
  }

  const vaultAge = useMemo(() => {
    if (!historicalDataAll || historicalDataAll.length === 0) return 0

    const firstDate = moment(historicalDataAll[0].date)
    const lastDate = moment(historicalDataAll[historicalDataAll.length - 1].date)
    return lastDate.diff(firstDate, 'days', false)
  }, [historicalDataAll])

  const maxDrawdown = useMemo(
    () => calculateMaxDrawdown(historicalData90d || []),
    [historicalData90d],
  )

  const metrics = [
    {
      value: vaultDetails.base_tokens_amount,
      label: 'TVL',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2, abbreviated: false },
    },
    {
      value: Number(vaultPnl?.total_pnl),
      label: 'Total PnL',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
    },
    {
      value: maxDrawdown,
      label: 'Max 90d Drawdown',
      formatOptions: {
        maxDecimals: 2,
        minDecimals: 2,
        abbreviated: true,
        suffix: '%',
      },
    },
    {
      value: vaultDetails.apy,
      label: 'APY',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%', abbreviated: true },
    },
    {
      value: vaultAge,
      label: 'Vault Age',
      formatOptions: { maxDecimals: 0, minDecimals: 0, suffix: ' days' },
    },
  ]
  return (
    <div className='flex flex-wrap sm:flex-nowrap justify-center gap-1 w-full'>
      {metrics.map((metric, index) => {
        const value = metric.isCurrency ? (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(vaultDetails.base_tokens_denom, BN(metric.value))}
            options={metric.formatOptions}
            className='text-sm'
          />
        ) : (
          <FormattedNumber
            amount={Number(metric.value)}
            options={metric.formatOptions}
            className='text-sm'
          />
        )
        return (
          <Card
            className='text-center py-3 w-[calc(50%-0.5rem)] md:w-45 bg-white/5'
            key={`${metric}-${index}`}
          >
            <TitleAndSubCell title={value} sub={metric.label} className='text-sm' />
          </Card>
        )
      })}
    </div>
  )
}
