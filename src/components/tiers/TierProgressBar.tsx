import classNames from 'classnames'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import useTierSystem from 'hooks/tiers/useTierSystem'

export default function TierProgressBar({ className }: { className?: string }) {
  const [tierData] = useTierSystem()
  const { currentTier, stakedAmount, progressToNextTier, marsNeededForNextTier, nextTier } =
    tierData

  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between py-2'>
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
                className='px-2 py-1 rounded text-xs font-medium mt-1'
                style={{ backgroundColor: nextTier.color + '20', color: nextTier.color }}
              >
                {nextTier.name}
              </div>
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
                  options={{ abbreviated: true, suffix: ' MARS till ' + nextTier.name }}
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
          <div className='text-center py-4'>
            <div
              className='inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium'
              style={{ backgroundColor: currentTier.color + '20', color: currentTier.color }}
            >
              🎉 Maximum Tier Achieved!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
