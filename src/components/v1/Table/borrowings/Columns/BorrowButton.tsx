import { useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useChainConfig from 'hooks/chain/useChainConfig'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

interface Props {
  data: BorrowMarketTableData
}
export default function BorrowButton(props: Props) {
  const address = useStore((s) => s.address)
  const { data: account } = useV1Account()
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis

  const hasCollateral = account?.lends?.length ?? 0 > 0

  const isUSDC = useMemo(
    () => !isOsmosis && props.data.asset?.symbol?.toUpperCase().includes('USDC'),
    [props.data.asset?.symbol, isOsmosis],
  )

  const isDisabled = !hasCollateral || isUSDC

  const tooltipContent = useMemo(() => {
    if (isUSDC) {
      return 'USDC borrowing is temporarily disabled.'
    }
    if (!hasCollateral) {
      return `You don't have assets deposited in the Red Bank. Please deposit assets before you borrow.`
    }
    return null
  }, [isUSDC, hasCollateral])

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
