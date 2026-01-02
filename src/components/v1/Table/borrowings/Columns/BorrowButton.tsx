import { useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'
import { ChainInfoID } from 'types/enums'

interface Props {
  data: BorrowMarketTableData
}
export default function BorrowButton(props: Props) {
  const address = useStore((s) => s.address)
  const chainConfig = useStore((s) => s.chainConfig)
  const { data: account } = useV1Account()

  const hasCollateral = account?.lends?.length ?? 0 > 0

  const isUSDC = useMemo(
    () => props.data.asset?.symbol?.toUpperCase().includes('USDC'),
    [props.data.asset?.symbol],
  )

  const isNeutron = chainConfig.id === ChainInfoID.Neutron1
  const isUSDCDisabled = isUSDC && isNeutron

  const isDisabled = !hasCollateral || isUSDCDisabled

  const tooltipContent = useMemo(() => {
    if (isUSDCDisabled) {
      return 'USDC borrowing is temporarily disabled.'
    }
    if (!hasCollateral) {
      return `You don't have assets deposited in the Red Bank. Please deposit assets before you borrow.`
    }
    return null
  }, [isUSDCDisabled, hasCollateral])

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={isDisabled && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={<Text size='sm'>{tooltipContent}</Text>}
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<Plus />}
          disabled={isDisabled}
          color='tertiary'
          onClick={(e) => {
            useStore.setState({
              v1BorrowAndRepayModal: { type: 'borrow', data: props.data },
            })
            e.stopPropagation()
          }}
          text='Borrow'
          short
        />
      </ConditionalWrapper>
    </div>
  )
}
