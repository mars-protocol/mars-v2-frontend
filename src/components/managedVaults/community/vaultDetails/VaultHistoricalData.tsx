import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  vaultAddress: string
}

export default function VaultHistoricalData(props: Props) {
  const { vaultAddress } = props

  const metrics = [
    {
      value: 212321,
      label: 'TVL',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2, abbreviated: true },
    },
    {
      value: 212321,
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
      value: 32,
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
    <div className='flex flex-wrap md:flex-nowrap items-center justify-center gap-2'>
      {metrics.map((metric, index) => {
        return (
          <Card className='text-center py-3 w-[calc(50%-0.5rem)] md:w-45 bg-white/5' key={index}>
            {metric.isCurrency ? (
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber('usd', BN(metric.value))}
                options={metric.formatOptions}
                className='text-sm'
              />
            ) : (
              <FormattedNumber
                amount={metric.value}
                options={metric.formatOptions}
                className='text-sm'
              />
            )}
            <Text size='xs' className='pt-1 text-white/40'>
              {metric.label}
            </Text>
          </Card>
        )
      })}
    </div>
  )
}
