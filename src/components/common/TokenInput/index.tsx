import classNames from 'classnames'

import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import DoubleLogo from 'components/common/DoubleLogo'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle, TrashBin } from 'components/common/Icons'
import NumberInput from 'components/common/NumberInput'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import WarningMessages from 'components/common/WarningMessages'
import AssetImage from 'components/common/assets/AssetImage'
import useAssets from 'hooks/assets/useAssets'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { getCurrentFeeToken, MIN_FEE_AMOUNT } from 'utils/feeToken'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChange: (amount: BigNumber) => void
  accountId?: string
  balances?: BNCoin[]
  className?: string
  disabled?: boolean
  hasSelect?: boolean
  maxText?: string
  onChangeAsset?: (asset: Asset) => void
  onDelete?: () => void
  warningMessages: string[]
  chainName?: string
  deductFee?: boolean
}

export default function TokenInput(props: Props) {
  const baseAsset = useBaseAsset()
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  const currentFeeToken = getCurrentFeeToken(chainConfig)
  const isCurrentFeeToken = currentFeeToken?.coinMinimalDenom === props.asset.denom
  const deductFee = isCurrentFeeToken && props.deductFee ? MIN_FEE_AMOUNT : 0

  const adjustedMax = useMemo(() => {
    return Math.max(props.max.minus(deductFee).toNumber(), 0)
  }, [deductFee, props.max])

  function onMaxBtnClick() {
    props.onChange(BN(adjustedMax))
  }

  function onChangeAsset(denom: string) {
    if (!props.onChangeAsset) return
    const newAsset = assets.find((asset) => asset.denom === denom) ?? baseAsset
    props.onChangeAsset(newAsset)
  }

  return (
    <div
      data-testid='token-input-component'
      className={classNames('flex w-full flex-col gap-2 transition-opacity', props.className, {
        'pointer-events-none opacity-50': props.disabled,
      })}
    >
      <div
        data-testid='token-input-wrapper'
        className={classNames(
          'relative isolate z-40 box-content flex h-11 w-full rounded-sm border bg-white/5',
          props.warningMessages.length ? 'border-warning' : 'border-white/20',
        )}
      >
        {props.hasSelect && props.balances ? (
          <Select
            options={props.balances}
            defaultValue={props.asset.denom}
            onChange={onChangeAsset}
            title={props.accountId ? `Credit Account ${props.accountId}` : 'Your Wallet'}
            className='h-full border-r border-white/20 bg-white/5'
            displayClassName=''
          />
        ) : (
          <div className='flex items-center gap-2 p-3 border-r min-w-fit border-white/20 bg-white/5'>
            {props.asset.poolInfo ? (
              <DoubleLogo
                primaryDenom={props.asset.poolInfo.assets.primary.denom ?? ''}
                secondaryDenom={props.asset.poolInfo.assets.secondary.denom ?? ''}
              />
            ) : (
              <AssetImage asset={props.asset} className='w-5 h-5' />
            )}
            <div className='flex flex-col'>
              <Text>{props.asset.symbol}</Text>
              {props.chainName && (
                <Text size='xs' className='text-white/50'>
                  {props.chainName}
                </Text>
              )}
            </div>
          </div>
        )}
        <NumberInput
          disabled={props.disabled}
          asset={props.asset}
          maxDecimals={props.asset.decimals}
          onChange={props.onChange}
          amount={props.amount}
          max={BN(adjustedMax)}
          className='flex-1 p-3 border-none'
        />
        {props.onDelete && (
          <div role='button' className='grid items-center pr-2' onClick={props.onDelete}>
            <div className='w-4'>
              <TrashBin />
            </div>
          </div>
        )}
        <WarningMessages messages={props.warningMessages} />
      </div>

      <div className='flex'>
        <div className='flex items-center flex-1'>
          {props.maxText && (
            <>
              <Text size='xs' className='mr-1 text-white' monospace>
                {`${props.maxText}:`}
              </Text>
              <FormattedNumber
                className='mr-1 text-xs text-white/50'
                amount={adjustedMax}
                options={{ decimals: props.asset.decimals }}
              />
              {isCurrentFeeToken && props.deductFee === true && !props.chainName && (
                <Tooltip
                  type='info'
                  content={`Some ${props.asset.symbol} will be reserved for transaction fees since this token is being used for gas payments.`}
                >
                  <span className='flex items-center mr-1 group hover:cursor-help'>
                    <InfoCircle className='w-3 h-3 text-white/50 group-hover:text-white' />
                  </span>
                </Tooltip>
              )}
              <Button
                dataTestId='token-input-max-button'
                color='tertiary'
                className='!h-4 !min-h-0 bg-white/20 !px-2 !py-0.5 text-2xs'
                variant='transparent'
                onClick={(e) => {
                  e.preventDefault()
                  onMaxBtnClick()
                }}
                disabled={props.disabled}
              >
                MAX
              </Button>
            </>
          )}
        </div>
        <div className='flex'>
          <DisplayCurrency
            isApproximation={props.amount.isGreaterThan(0)}
            className='inline pl-1 text-xs text-white/50'
            coin={new BNCoin({ denom: props.asset.denom, amount: props.amount.toString() })}
            options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      </div>
    </div>
  )
}
