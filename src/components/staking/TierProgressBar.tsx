import classNames from 'classnames'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import useTierSystem from 'hooks/staking/useTierSystem'

export default function TierProgressBar({ className }: { className?: string }) {
  const [tierData] = useTierSystem()
  const { currentTier, stakedAmount, progressToNextTier, marsNeededForNextTier, nextTier } =
    tierData

  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between pb-2'>
          <div className='py-1'>
            <Text size='sm' className='text-white/60'>
              Staked MARS
            </Text>
            <div className='flex items-center gap-2 mt-1'>
              <FormattedNumber
                amount={stakedAmount.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-lg font-semibold text-white'
              />
              <div
                className='px-2 py-1 rounded text-xs font-medium'
                style={{ backgroundColor: currentTier.color + '20', color: currentTier.color }}
              >
                {currentTier.name}
              </div>
            </div>
          </div>

          {nextTier && (
            <div className='text-right py-1'>
              <Text size='sm' className='text-white/60'>
                Next Tier
              </Text>
              <div
                className='px-2 py-1 rounded text-xs font-medium mt-1 inline-block'
                style={{ backgroundColor: nextTier.color + '20', color: nextTier.color }}
              >
                {nextTier.name}
              </div>
            </div>
          )}
        </div>
        <div className='flex w-full'>
          <div className='flex-row items-center gap-2 w-1/2 flex-wrap mb-4'>
            <Text size='sm' className='text-white/60 pb-1'>
              Current Tier Benefits
            </Text>
            <ul className='list-disc p-0 pl-4'>
              {currentTier.benefits.map((benefit) => (
                <li key={benefit}>
                  <Text size='sm'>{benefit}</Text>
                </li>
              ))}
            </ul>
          </div>
          {nextTier && (
            <div className='flex-row items-center gap-2 w-1/2 flex-wrap mb-4 text-right'>
              <Text size='sm' className='text-white/60 text-right pb-1'>
                Next Tier Benefits
              </Text>
              <ul className='list-disc p-0 pl-4 inline-block'>
                {nextTier.benefits.map((benefit) => (
                  <li key={benefit}>
                    <Text size='sm'>{benefit}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {nextTier ? (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <Text className='text-white/60'>Progress to {nextTier.name}</Text>
              <Text className='text-white/60'>
                <FormattedNumber
                  amount={marsNeededForNextTier.toNumber()}
                  options={{
                    abbreviated: false,
                    suffix: ' MARS till ' + nextTier.name,
                    maxDecimals: 6,
                  }}
                />
              </Text>
            </div>
            <div className='relative'>
              <div className='w-full bg-white/10 rounded-full h-3'>
                <div
                  className='h-3 rounded-full transition-all duration-500 ease-out'
                  style={{
                    width: `${progressToNextTier}%`,
                    background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                  }}
                />
              </div>
              <div className='flex justify-between mt-1 text-xs text-white/40'>
                <span>
                  <FormattedNumber amount={currentTier.minAmount} options={{ abbreviated: true }} />
                </span>
                <span>
                  <FormattedNumber amount={nextTier.minAmount} options={{ abbreviated: true }} />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <div
              className='inline-flex items-center px-4 py-2 rounded-md text-sm font-medium'
              style={{ backgroundColor: currentTier.color + '20', color: currentTier.color }}
            >
              You are on the maximum Tier and a true Martian!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
