import { RouteResponse } from '@skip-go/client'
import classNames from 'classnames'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import { Clock } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { findBalanceForAsset } from 'utils/balances'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  balances: WrappedBNCoin[]
  denom: string
  chainName?: string
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string, chainName?: string) => void
  onChange?: () => void
  routeResponse?: RouteResponse
}

export default function AccountFundRow(props: Props) {
  const asset = useAsset(props.denom)
  if (!asset) return null

  const balance = findBalanceForAsset(props.balances, props.denom, props.chainName || undefined)
  const chainName = props.chainName && props.chainName !== '' ? props.chainName : undefined

  const receivedAmount =
    props.routeResponse && !props.amount.isZero() ? BN(props.routeResponse.amountOut) : props.amount
  const formattedReceivedAmount = receivedAmount.dividedBy(10 ** asset.decimals)
  const isEVMAsset = !!chainName

  const impactPercentage =
    props.amount.isZero() || !props.routeResponse
      ? BN_ZERO
      : BN(props.routeResponse.usdAmountIn || '0')
          .minus(props.routeResponse.usdAmountOut || '0')
          .dividedBy(props.routeResponse.usdAmountIn || '1')
          .multipliedBy(100)

  const durationInMinutes = props.routeResponse
    ? Math.ceil(props.routeResponse.estimatedRouteDurationSeconds / 60)
    : 20

  const handleChange = (amount: BigNumber) => {
    props.updateFundingAssets(amount, props.denom, chainName)
    if (props.onChange) {
      props.onChange()
    }
  }

  return (
    <>
      <TokenInputWithSlider
        asset={asset}
        onChange={handleChange}
        amount={props.amount}
        max={BN(balance)}
        balances={props.balances.map((wrappedCoin) => wrappedCoin.coin)}
        maxText='Max'
        disabled={props.isConfirming}
        warningMessages={[]}
        chainName={chainName}
      />

      {isEVMAsset && props.routeResponse && (
        <div className='mt-4'>
          <div className='flex flex-row justify-between items-center p-2 rounded-sm border border-white/20 bg-white/5'>
            <Text size='sm' className='text-white'>
              You will receive
            </Text>
            <Text
              className={classNames(
                'text-sm mt-1',
                props.amount.isZero() ? 'text-white/50' : 'text-white',
              )}
            >
              {formattedReceivedAmount.toFormat(2)} {asset.symbol}
            </Text>
          </div>
          <div className='flex items-center justify-between px-1 mt-2'>
            <div className='flex items-center gap-1.5 text-white/60'>
              <Clock className='w-3.5 h-3.5' />
              <Text size='xs'>~{durationInMinutes} min</Text>
            </div>
            <div className='flex items-center gap-1.5'>
              <Text size='xs' className='text-white/60'>
                ~ ${props.routeResponse?.usdAmountOut || '0.00'}
              </Text>
              {!props.amount.isZero() && props.routeResponse && (
                <Text
                  size='xs'
                  className={classNames(
                    impactPercentage.isPositive() ? 'text-error' : 'text-success',
                  )}
                >
                  {impactPercentage.isPositive() ? '▼' : '▲'} {impactPercentage.abs().toFixed(1)}%
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      {asset.campaigns.length > 0 &&
        asset.campaigns.map((campaign, index) => (
          <div
            className='flex justify-center w-full p-2 mt-4 border rounded border-white/20'
            key={index}
          >
            <AssetCampaignCopy
              campaign={campaign}
              asset={asset}
              size='sm'
              amount={props.amount}
              withLogo
              className='justify-center'
            />
          </div>
        ))}
    </>
  )
}
