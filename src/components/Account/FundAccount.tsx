'use client'

import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { Button } from 'components/Button'
import { ArrowRight, Cross } from 'components/Icons'
import SwitchWithLabel from 'components/SwitchWithLabel'
import { Text } from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import useParams from 'utils/route'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

interface Props {
  setShowFundAccount: (show: boolean) => void
  setShowMenu: (show: boolean) => void
}

export default function FundAccount(props: Props) {
  const params = useParams()
  const deposit = useStore((s) => s.deposit)

  const [amount, setAmount] = useState(0)
  const [isLending, setIsLending] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  const onChangeAmount = useCallback((amount: number) => {
    setAmount(amount)
  }, [])

  const handleLendAssets = useCallback((val: boolean) => {
    setIsLending(val)
    /* TODO: handle lending assets */
  }, [])

  async function onDeposit() {
    setIsFunding(true)
    // TODO: Make this dynamic (token select)
    const result = await deposit({
      fee: hardcodedFee,
      accountId: params.accountId,
      coin: {
        denom: ASSETS[0].denom,
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
          {`Fund Account ${params.accountId}`}
        </Text>
        <Text className='mb-4 text-white/70'>
          Deposit assets from your Osmosis address to your Mars credit account. Bridge assets if
          your Osmosis address has no assets.
        </Text>
        <TokenInputWithSlider
          asset={ASSETS[0]}
          onChange={onChangeAmount}
          amount={amount}
          max={new BigNumber(1).shiftedBy(ASSETS[0].decimals).toNumber()}
          className='mb-4'
          disabled={isFunding}
        />
        <div className='mb-4 w-full border-b border-white/10' />
        <SwitchWithLabel
          name='isLending'
          label='Lend assets to earn yield'
          value={isLending}
          onChange={handleLendAssets}
          className='mb-4'
          tooltip="Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!"
          disabled={isFunding || amount === 0}
        />
        <Button
          className='w-full'
          showProgressIndicator={isFunding}
          disabled={amount === 0}
          text='Fund Account'
          rightIcon={<ArrowRight />}
          onClick={onDeposit}
        />
      </div>
    </>
  )
}
