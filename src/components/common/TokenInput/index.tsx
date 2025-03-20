import classNames from 'classnames'

import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import DoubleLogo from 'components/common/DoubleLogo'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle, TrashBin } from 'components/common/Icons'
import NumberInput from 'components/common/NumberInput'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import WarningMessages from 'components/common/WarningMessages'
import AssetImage from 'components/common/assets/AssetImage'
import useAssets from 'hooks/assets/useAssets'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { deductFeeFromMax } from 'utils/feeToken'
import { getCurrentFeeToken } from 'hooks/wallet/useFeeToken'
import { useMemo } from 'react'
import { Tooltip } from 'components/common/Tooltip'

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
  const { data: assets } = useAssets()

  const currentFeeToken = getCurrentFeeToken()
  const isCurrentFeeToken = currentFeeToken?.coinMinimalDenom === props.asset.denom

  const adjustedMax = useMemo(() => {
    if (props.deductFee === true && isCurrentFeeToken) {
      return deductFeeFromMax(props.max, props.asset.denom, props.asset.decimals)
    }
    return props.max
  }, [props.max, props.asset.denom, props.asset.decimals, isCurrentFeeToken, props.deductFee])

  const feeWarningMessages = useMemo(() => {
    const messages = [...props.warningMessages]

    if (isCurrentFeeToken && props.deductFee === true && !props.max.isZero()) {
      messages.push(
        `Some ${props.asset.symbol} will be reserved for transaction fees. This token is currently being used for gas fees.`,
      )
    }

    return messages
  }, [props.warningMessages, isCurrentFeeToken, props.deductFee, props.max, props.asset.symbol])

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
          feeWarningMessages.length ? 'border-warning' : 'border-white/20',
        )}
      >
        {props.hasSelect && props.balances ? (
          <Select
            options={props.balances}
            defaultValue={props.asset.denom}
            onChange={onChangeAsset}
            title={props.accountId ? `Credit Account ${props.accountId}` : 'Your Wallet'}
            className='h-full border-r border-white/20 bg-white/5'
            displayClassName='rounded-l-sm'
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
          max={adjustedMax}
          className='flex-1 p-3 border-none'
        />
        {props.onDelete && (
          <div role='button' className='grid items-center pr-2' onClick={props.onDelete}>
            <div className='w-4'>
              <TrashBin />
            </div>
          </div>
        )}
        <WarningMessages messages={feeWarningMessages} />
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
                amount={props.max.toNumber()}
                options={{ decimals: props.asset.decimals }}
              />
              {isCurrentFeeToken && props.deductFee === true && (
                <Tooltip
                  type='info'
                  content={`Some ${props.asset.symbol} will be reserved for transaction fees since this token is being used for gas payments.`}
                >
                  <span className='flex items-center mr-1'>
                    <Text size='xs' className='text-warning mr-1'>
                      (-fee)
                    </Text>
                    <InfoCircle className='w-3 h-3 text-warning/70' />
                  </span>
                </Tooltip>
              )}
              <Button
                dataTestId='token-input-max-button'
                color='tertiary'
                className='!h-4 !min-h-0 bg-white/20 !px-2 !py-0.5 text-2xs'
                variant='transparent'
                onClick={onMaxBtnClick}
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
