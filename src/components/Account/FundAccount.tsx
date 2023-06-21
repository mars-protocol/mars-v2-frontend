import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import { ArrowRight, Cross } from 'components/Icons'
import SwitchWithLabel from 'components/SwitchWithLabel'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { getAmount } from 'utils/accounts'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'

interface Props {
  setShowFundAccount: (show: boolean) => void
  setShowMenu: (show: boolean) => void
}

export default function FundAccount(props: Props) {
  const { accountId } = useParams()
  const deposit = useStore((s) => s.deposit)
  const balances = useStore((s) => s.balances)

  const [amount, setAmount] = useState(BN(0))
  const [asset, setAsset] = useState<Asset>(ASSETS[0])
  const [isLending, setIsLending] = useToggle()
  const [isFunding, setIsFunding] = useToggle()

  const max = getAmount(asset.denom, balances ?? [])

  const onChangeAmount = useCallback((amount: BigNumber) => {
    setAmount(amount)
  }, [])

  const onChangeAsset = useCallback((asset: Asset) => {
    setAsset(asset)
  }, [])

  const handleLendAssets = useCallback(
    (val: boolean) => {
      setIsLending(val)
      /* TODO: handle lending assets */
    },
    [setIsLending],
  )

  async function onDeposit() {
    if (!accountId) return
    setIsFunding(true)
    const result = await deposit({
      fee: hardcodedFee,
      accountId,
      coin: {
        denom: asset.denom,
        amount: amount.toString(),
      },
    })
    setIsFunding(false)
    if (result) {
      props.setShowMenu(false)
      props.setShowFundAccount(false)
    }
  }

  return (
    <>
      <div className='absolute right-4 top-4'>
        <Button
          onClick={() => props.setShowFundAccount(false)}
          leftIcon={<Cross />}
          className='h-8 w-8'
          iconClassName='h-2 w-2'
          color='tertiary'
        />
      </div>
      <div className='relative z-10 w-full p-4'>
        <Text size='lg' className='mb-2 font-bold'>
          {`Fund Account ${accountId}`}
        </Text>
        <Text className='mb-4 text-white/70'>
          Deposit assets from your Osmosis address to your Mars credit account. Bridge assets if
          your Osmosis address has no assets.
        </Text>
        <TokenInputWithSlider
          asset={asset}
          onChange={onChangeAmount}
          onChangeAsset={onChangeAsset}
          amount={amount}
          max={max}
          className='mb-4'
          disabled={isFunding}
          hasSelect
          balances={balances}
        />
        <div className='mb-4 w-full border-b border-white/10' />
        <SwitchWithLabel
          name='isLending'
          label='Lend assets to earn yield'
          value={isLending}
          onChange={() => handleLendAssets(!isLending)}
          className='mb-4'
          tooltip="Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!"
          disabled={isFunding || amount.isEqualTo(0)}
        />
        <Button
          className='w-full'
          showProgressIndicator={isFunding}
          disabled={amount.isEqualTo(0)}
          text='Fund Account'
          rightIcon={<ArrowRight />}
          onClick={onDeposit}
        />
      </div>
    </>
  )
}
