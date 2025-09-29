import classNames from 'classnames'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { Tooltip } from 'components/common/Tooltip'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import AnimatedCircularProgressBar from 'components/common/ProgressBars/AnimatedCircularProgressBar'
import Text from 'components/common/Text'
import { BNCoin } from 'types/classes/BNCoin'
import useAssets from 'hooks/assets/useAssets'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import { getCoinValueWithoutFallback } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { FormattedNumber } from './FormattedNumber'

interface Props {
  depositCap: DepositCap
}

export default function DepositCapCell(props: Props) {
  const { data: assets } = useAssets()
  const displayCurrencies = useDisplayCurrencyAssets()
  const [displayCurrency] = useDisplayCurrency()

  const displayCurrencyAsset = displayCurrencies.find((asset) => asset.denom === displayCurrency)

  const depositedCoin = BNCoin.fromDenomAndBigNumber(props.depositCap.denom, props.depositCap.used)
  const depositCapCoin = BNCoin.fromDenomAndBigNumber(props.depositCap.denom, props.depositCap.max)

  const percent = props.depositCap.max.isZero()
    ? BN(0)
    : props.depositCap.used.dividedBy(props.depositCap.max).multipliedBy(100)

  const capUsedPercent = percent.toNumber()
  const depositCapUsed = Number.isFinite(capUsedPercent) ? Math.min(capUsedPercent, 100) : 0

  const valueClassName = 'text-xs text-white font-semibold whitespace-nowrap text-right'

  const depositedValue = getCoinValueWithoutFallback(depositedCoin, assets)
  const depositCapValue = getCoinValueWithoutFallback(depositCapCoin, assets)

  // Get asset info for proper formatting
  const asset = assets?.find((a) => a.denom === props.depositCap.denom)
  const decimals = displayCurrencyAsset?.decimals ?? 2
  const gaugeMax = depositCapValue?.shiftedBy(-decimals).toNumber() ?? 0
  const gaugeValue = depositedValue?.shiftedBy(-decimals).toNumber() ?? 0

  // Determine colors based on usage
  let gaugePrimaryColor = '#FFFFFF'
  if (depositCapUsed >= 100) {
    gaugePrimaryColor = '#F87171'
  } else if (depositCapUsed > 90) {
    gaugePrimaryColor = '#38BDF8'
  }

  let displayCurrencyColorClass = 'text-white/40'
  if (depositCapUsed >= 100) {
    displayCurrencyColorClass = 'text-loss'
  } else if (depositCapUsed > 90) {
    displayCurrencyColorClass = 'text-info'
  }

  const tooltipContent = (
    <div className='flex flex-col gap-3 p-1'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-start justify-between gap-6 whitespace-nowrap'>
          <Text size='2xs' className='text-white/60'>
            Deposits
          </Text>
          <div className='flex flex-col items-end gap-0.5 text-right'>
            <DisplayCurrency coin={depositedCoin} className={valueClassName} />
            <span className='text-[10px] text-white/40'>
              {asset && (
                <FormattedNumber
                  amount={depositedCoin.amount.toNumber()}
                  className='text-xs text-white/60 whitespace-nowrap'
                  options={{
                    abbreviated: true,
                    decimals: asset?.decimals,
                    minDecimals: 0,
                    maxDecimals: Math.min(asset?.decimals, 6),
                  }}
                />
              )}
            </span>
          </div>
        </div>
        <div className='flex items-start justify-between gap-6 whitespace-nowrap'>
          <Text size='2xs' className='text-white/60'>
            Deposit Cap
          </Text>
          <div className='flex flex-col items-end gap-0.5 text-right'>
            <DisplayCurrency coin={depositCapCoin} className={valueClassName} />
            <span className='text-[10px] text-white/40'>
              {asset && (
                <FormattedNumber
                  amount={depositCapCoin.amount.toNumber()}
                  className='text-xs text-white/60 whitespace-nowrap'
                  options={{
                    abbreviated: true,
                    decimals: asset?.decimals,
                    minDecimals: 0,
                    maxDecimals: Math.min(asset?.decimals, 6),
                  }}
                />
              )}
            </span>
          </div>
        </div>
        <div className='flex items-start justify-between gap-6 whitespace-nowrap'>
          <Text size='2xs' className='text-white/60'>
            Remaining
          </Text>
          <div className='flex flex-col items-end gap-0.5 text-right'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(
                props.depositCap.denom,
                props.depositCap.max.minus(props.depositCap.used),
              )}
              className={valueClassName}
            />
            <span className='text-[10px] text-white/40'>
              {asset && (
                <FormattedNumber
                  amount={props.depositCap.max.minus(props.depositCap.used).toNumber()}
                  className='text-xs text-white/60 whitespace-nowrap'
                  options={{
                    abbreviated: true,
                    decimals: asset?.decimals,
                    minDecimals: 0,
                    maxDecimals: Math.min(asset?.decimals, 6),
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </div>
      <AnimatedCircularProgressBar
        value={gaugeValue}
        max={gaugeMax}
        min={0}
        gaugePrimaryColor={gaugePrimaryColor}
        gaugeSecondaryColor='rgba(255, 255, 255, 0.1)'
        className='mx-auto h-24 w-24 text-sm'
      />
    </div>
  )

  return (
    <TitleAndSubCell
      containerClassName='gap-0'
      className='w-full text-xs leading-tight'
      title={<DisplayCurrency coin={depositedCoin} className={valueClassName} />}
      sub={
        <div className='flex justify-end'>
          <Tooltip type='info' content={tooltipContent} underline>
            <DisplayCurrency
              coin={depositCapCoin}
              className={classNames(valueClassName, displayCurrencyColorClass)}
            />
          </Tooltip>
        </div>
      }
    />
  )
}
