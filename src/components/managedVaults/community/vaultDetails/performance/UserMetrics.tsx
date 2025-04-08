import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export default function UserMetrics() {
  const metrics = [
    {
      value: 1250.45,
      label: 'My Current Balance',
      suffix: ' USDC',
    },
    {
      value: 125.32,
      label: 'Total Earnings',
      suffix: ' USDC',
    },
    {
      value: 10.02,
      label: 'ROI',
      color: 'text-green-400',
      suffix: '%',
    },
    {
      value: 2.15,
      label: 'Vault Shares',
      suffix: '%',
    },
  ]

  return (
    <div className='flex w-full'>
      {metrics.map((metric, index) => (
        <>
          <div className='flex-1 relative text-center py-4'>
            <TitleAndSubCell
              title={
                <FormattedNumber
                  amount={metric.value}
                  options={{
                    maxDecimals: 2,
                    minDecimals: 2,
                    suffix: metric.suffix,
                  }}
                  className='text-base'
                />
              }
              sub={metric.label}
            />
            {index < metrics.length - 1 && (
              <div className='absolute right-0 top-1/2 h-8 w-[1px] bg-white/10 -translate-y-1/2' />
            )}
          </div>
        </>
      ))}
    </div>
  )
}
