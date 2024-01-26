import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'

import Card from 'components/common/Card'
import LeverageSlider from 'components/common/LeverageSlider'
import { Spacer } from 'components/common/Spacer'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { perpsAsset } = usePerpsAsset()
  const [leverage, setLeverage] = useState<number>(1)
  const account = useCurrentAccount()
  const { simulatePerps, addedPerps, updatedAccount } = useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const perpsBaseDenom = 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3'

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

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col h-full pb-4'
      title={<AssetSelectorPerps asset={perpsAsset} />}
      className='h-full mb-4'
    >
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />

      <TradeDirectionSelector direction={tradeDirection} onChangeDirection={setTradeDirection} />
      <AssetAmountInput
        label='Amount'
        max={BN(1000000)} // TODO: Implement max calculation
        amount={amount}
        setAmount={setAmount}
        asset={perpsAsset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      <Or />
      <Text size='sm'>Position Leverage</Text>
      <LeverageSlider
        min={1}
        max={10}
        value={leverage}
        onChange={setLeverage}
        type={tradeDirection}
      />
      <LeverageButtons />
      <Spacer />
      <PerpsSummary
        amount={amount}
        tradeDirection={tradeDirection}
        asset={perpsAsset}
        leverage={leverage}
      />
    </Card>
  )
}
