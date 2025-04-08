import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  vaultDetails: ExtendedManagedVaultDetails
}

export default function PerformanceCard(props: Props) {
  const { vaultDetails } = props
  const metrics = [
    {
      value: vaultDetails.base_tokens_amount,
      label: 'TVL',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2, abbreviated: true },
    },
    {
      value: 212343443321,
      label: 'Volume (30d)',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2, abbreviated: true },
    },
    {
      value: 3,
      label: 'Max Daily Drawdown',
      formatOptions: {
        maxDecimals: 2,
        minDecimals: 2,
        abbreviated: true,
        suffix: '%',
      },
    },
    {
      value: 22,
      // value: vaultDetails.metrics.apy,
      label: 'APY',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%' },
    },
    {
      value: 45,
      label: 'Vault Age',
      formatOptions: { maxDecimals: 0, minDecimals: 0, suffix: ' days' },
    },
  ]
  return (
    <div className='flex flex-col gap-1 w-full'>
      <div className='flex gap-1'>
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
    </div>
  )
}
