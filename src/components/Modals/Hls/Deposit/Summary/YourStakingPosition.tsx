import Button from 'components/common/Button'
import Container from 'components/common/Container'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import { RouteInfo, SwapAssets } from 'components/common/RouteInfo'
import SummaryLine from 'components/common/SummaryLine'
import AprBreakdown from 'components/Modals/Hls/Deposit/Summary/ApyBreakdown'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  baseApy: number
  borrowRate: number
  leverage: number
  positionValue: BNCoin
  assets: SwapAssets
  disabled: boolean
  onClickBtn: () => void
  route?: SwapRouteInfo | null
}

export default function YourStakingPosition(props: Props) {
  const netApy = useMemo(
    () => props.baseApy * props.leverage - props.borrowRate * (props.leverage - 1),
    [props.baseApy, props.borrowRate, props.leverage],
  )
  const apyItems = useMemo(
    () => [
      {
        title: 'Base APY',
        amount: props.baseApy,
      },
      {
        title: 'Levered APY',
        amount: props.baseApy * props.leverage,
      },
      {
        title: 'Borrow Rate',
        amount: props.borrowRate * (props.leverage - 1),
      },
    ],
    [props.baseApy, props.borrowRate, props.leverage],
  )

  return (
    <Container title='Your Position'>
      <SummaryLine label='Total Position Value'>
        <DisplayCurrency coin={props.positionValue} />
      </SummaryLine>
      <SummaryLine label='Leverage'>
        <FormattedNumber amount={props.leverage} options={{ suffix: 'x' }} />
      </SummaryLine>
      <SummaryLine label='Net APY' tooltip={<AprBreakdown items={apyItems} />}>
        <FormattedNumber
          amount={netApy}
          options={{ suffix: '%', minDecimals: 0, maxDecimals: 2 }}
        />
      </SummaryLine>
      <Divider className='mt-4 mb-2' />
      {props.route && <RouteInfo title='Swap summary' route={props.route} assets={props.assets} />}
      <Button
        onClick={props.onClickBtn}
        text='Approve Funding Transaction'
        rightIcon={<ArrowRight />}
        className='w-full mt-6 '
        disabled={props.disabled}
      />
    </Container>
  )
}
