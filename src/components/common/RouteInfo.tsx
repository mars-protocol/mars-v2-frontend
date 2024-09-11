import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import { BNCoin } from 'types/classes/BNCoin'
import { ChevronDown } from 'components/common/Icons'
import { ChainInfoID } from 'types/enums'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { formatValue } from 'utils/formatters'

interface Props {
  assets: SwapAssets
  route: SwapRouteInfo
  title: string
  tradeInfo?: TradeInfo
}

interface TradeInfo {
  minReceive: BigNumber
  slippage: number
}

export interface SwapAssets {
  in: Asset
  out: Asset
}

export function RouteInfo(props: Props) {
  const [showSummary, setShowSummary] = useToggle()
  const chainConfig = useChainConfig()

  return (
    <div className='flex flex-col'>
      <div
        className='relative w-full pr-4 hover:pointer mb-1 mt-2'
        role='button'
        onClick={() => setShowSummary(!showSummary)}
      >
        <Text size='xs' className='font-bold text-white/80'>
          {props.title}
        </Text>
        <div
          className={classNames(
            'absolute right-0 w-3 text-center top-1',
            showSummary && 'rotate-180',
          )}
        >
          <ChevronDown />
        </div>
      </div>
      {showSummary && (
        <>
          <SummaryLine label='Price impact' className='mt-2'>
            <FormattedNumber
              amount={props.route.priceImpact.toNumber() || 0}
              options={{ suffix: '%' }}
              className={classNames({
                'text-info': props.route.priceImpact.toNumber() > 5,
              })}
            />
          </SummaryLine>
          {chainConfig.isOsmosis && (
            <SummaryLine
              label={`Swap fees ${
                props.route.fee
                  ? formatValue(props.route.fee.times(100).decimalPlaces(2).toNumber(), {
                      prefix: '(',
                      suffix: '%)',
                    })
                  : ''
              }`}
            >
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(props.assets.in.denom, props.route.fee)}
              />
            </SummaryLine>
          )}
          <SummaryLine label='Route'>{props.route.description}</SummaryLine>
          {props.tradeInfo && (
            <SummaryLine label={`Min receive (${props.tradeInfo.slippage * 100}% slippage)`}>
              <FormattedNumber
                amount={props.tradeInfo.minReceive.toNumber()}
                options={{
                  decimals: props.assets.out.decimals,
                  suffix: ` ${props.assets.out.symbol}`,
                  maxDecimals: 6,
                }}
              />
            </SummaryLine>
          )}
          <Divider className='my-2' />
        </>
      )}
    </div>
  )
}
