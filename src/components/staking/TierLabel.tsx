import classNames from 'classnames'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useTierSystem from 'hooks/staking/useTierSystem'

export default function TierLabel({
  amount,
  className,
  withTooltip = false,
}: {
  amount: number
  withTooltip?: boolean
  className?: string
}) {
  const { calculateTier } = useTierSystem()
  const tier = calculateTier(amount)

  const tierLabel = (
    <div
      className={classNames('px-2 py-1 rounded text-xs font-medium inline-block', className)}
      style={{ backgroundColor: tier.color + '20', color: tier.color }}
    >
      {tier.name}
    </div>
  )

  if (!withTooltip) {
    return tierLabel
  }

  return (
    <div className='flex items-center gap-1'>
      {tierLabel}
      <Tooltip
        type='info'
        content={
          <div className='flex flex-col gap-2'>
            <Text size='sm' className='font-semibold'>
              {tier.name}
            </Text>
            <Text size='xs' className='text-white/80'>
              Staking Benefits:
            </Text>
            <div className='flex flex-col gap-1'>
              {tier.benefits.map((benefit, index) => (
                <Text key={index} size='xs' className='text-white/70'>
                  • {benefit}
                </Text>
              ))}
            </div>
          </div>
        }
      >
        <div className='inline-block w-3 h-3 hover:cursor-help opacity-60 hover:opacity-100 transition-opacity'>
          <InfoCircle />
        </div>
      </Tooltip>
    </div>
  )
}
