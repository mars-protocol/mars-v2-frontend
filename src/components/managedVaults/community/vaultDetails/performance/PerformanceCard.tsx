import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'

interface Props {
  vaultDetails: ExtendedManagedVaultDetails
  vaultAddress: string
}

export default function PerformanceCard(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const { data: historicalData } = useHistoricalVaultData(vaultAddress, 90)

  const calculateMaxDrawdown = (data: HistoricalVaultChartData[]) => {
    if (!data || data.length <= 1) return 0

    let peak = data[0].sharePrice
    let maxDrawdown = 0

    for (let i = 1; i < data.length; i++) {
      const point = data[i]
      if (point.sharePrice > peak) {
        peak = point.sharePrice
      } else {
        const drawdown = ((peak - point.sharePrice) / peak) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    return maxDrawdown
  }

  const maxDrawdown = historicalData ? calculateMaxDrawdown(historicalData) : 0
  const metrics = [
    {
      value: vaultDetails.base_tokens_amount,
      label: 'TVL',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2, abbreviated: false },
    },
    {
      value: 0,
      label: 'Volume (30d)',
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
      value: vaultDetails.metrics.apy,
      label: 'APY',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%', abbreviated: true },
    },
    {
      value: 0,
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
          <Card className='text-center py-3 w-[calc(50%-0.5rem)] md:w-45 bg-white/5' key={index}>
            <TitleAndSubCell title={value} sub={metric.label} className='text-sm' />
          </Card>
        )
      })}
    </div>
  )
}
