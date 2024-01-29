import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'

import { Cross } from 'components/common/Icons'
import LeverageSlider from 'components/common/LeverageSlider'
import { Spacer } from 'components/common/Spacer'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import usePerpsManageModule from 'components/perps/Module/PerpsManageModule/usePerpsManageModule'
import PerpsSummary from 'components/perps/Module/Summary'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import { BN_ONE } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function PerpsManageModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection | null>(null)
  const [amount, setAmount] = useState<BigNumber | null>(null)
  const account = useCurrentAccount()
  const { simulatePerps, addedPerps } = useUpdatedAccount(account)
  const perpsBaseDenom = 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3'
  const { perpsAsset } = usePerpsAsset()

  const {
    closeManagePerpModule,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    asset,
  } = usePerpsManageModule(amount)

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((perpsPosition: PerpsPosition) => {
        if (
          addedPerps &&
          perpsPosition.amount === addedPerps.amount &&
          perpsPosition.tradeDirection === addedPerps.tradeDirection
        )
          return
        simulatePerps(perpsPosition)
      }, 100),
    [simulatePerps, addedPerps],
  )

  useEffect(() => {
    if (!amount || !perpsAsset || !tradeDirection) return
    const perpsPosition = {
      amount,
      closingFee: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ONE),
      pnl: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ONE.negated()),
      entryPrice: BN_ONE,
      baseDenom: perpsBaseDenom,
      denom: perpsAsset.denom,
      tradeDirection,
    }
    debouncedUpdateAccount(perpsPosition)
  }, [debouncedUpdateAccount, amount, perpsAsset, tradeDirection, perpsBaseDenom])

  if (!asset) return null

  return (
    <div
      className={classNames(
        'px-4 gap-5 flex flex-col h-full pt-6 pb-4 w-full bg-white/5 absolute rounded-base isolate',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      <div className='flex justify-between mb-3'>
        <Text>Manage Position</Text>
        <button onClick={closeManagePerpModule} className='mr-1.5'>
          <Cross width={16} />
        </button>
      </div>
      <TradeDirectionSelector
        direction={tradeDirection ?? previousTradeDirection}
        onChangeDirection={setTradeDirection}
      />
      <AssetAmountInput
        label='Amount'
        max={BN(100000)} // TODO: Implement max calculation
        amount={amount ?? previousAmount}
        setAmount={setAmount}
        asset={asset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      <Or />
      <Text size='sm'>Position Leverage</Text>
      <LeverageSlider max={0} value={0} onChange={() => {}} type={tradeDirection || 'long'} />
      <LeverageButtons />
      <Spacer />
      <PerpsSummary
        changeTradeDirection
        amount={amount ?? previousAmount}
        tradeDirection={tradeDirection ?? previousTradeDirection}
        asset={asset}
        leverage={leverage}
        previousAmount={previousAmount}
        previousTradeDirection={previousTradeDirection}
        previousLeverage={previousLeverage}
      />
    </div>
  )
}
