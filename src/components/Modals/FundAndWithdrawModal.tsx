import { useEffect, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { getAmount } from 'utils/accounts'
import { hardcodedFee } from 'utils/contants'
import { BN } from 'utils/helpers'

export default function FundAndWithdrawModal() {
  const currentAccount = useCurrentAccount()
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const withdraw = useStore((s) => s.withdraw)
  const deposit = useStore((s) => s.deposit)
  const [amount, setAmount] = useState(BN(0))
  const [currentAsset, setCurrentAsset] = useState(baseCurrency)
  const [change, setChange] = useState<AccountChange | undefined>()
  const [isConfirming, setIsConfirming] = useToggle()
  const balances = useStore((s) => s.balances)
  const isFunding = modal === 'fund'

  function resetState() {
    setCurrentAsset(baseCurrency)
    setAmount(BN(0))
    setChange(undefined)
  }

  function onClose() {
    resetState()
    useStore.setState({ fundAndWithdrawModal: null })
  }

  async function onConfirm() {
    if (!currentAccount) return
    setIsConfirming(true)
    let result
    if (isFunding) {
      result = await deposit({
        fee: hardcodedFee,
        accountId: currentAccount.id,
        coin: {
          denom: currentAsset.denom,
          amount: amount.toString(),
        },
      })
    } else {
      result = await withdraw({
        fee: hardcodedFee,
        accountId: currentAccount.id,
        coin: {
          denom: currentAsset.denom,
          amount: amount.toString(),
        },
      })
    }

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  const max = isFunding
    ? getAmount(currentAsset.denom, balances ?? [])
    : currentAccount
    ? getAmount(currentAsset.denom, currentAccount.deposits)
    : BN(0)

  useEffect(() => {
    setChange({
      deposits: [
        {
          amount: isFunding ? BN(0).plus(amount).toString() : BN(0).minus(amount).toString(),
          denom: currentAsset.denom,
        },
      ],
    })
  }, [amount, currentAsset, currentAccount, isFunding])

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          <Text>
            {isFunding
              ? `Fund Account ${currentAccount?.id ?? '0'}`
              : `Withdraw from Account ${currentAccount?.id ?? '0'}`}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col min-h-[400px]'
    >
      <div className='flex flex-grow items-start gap-6 p-6'>
        <Card
          className='flex flex-grow bg-white/5 p-4'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          <TokenInputWithSlider
            asset={currentAsset}
            onChange={(val) => {
              setAmount(val)
            }}
            onChangeAsset={(asset) => {
              setCurrentAsset(asset)
            }}
            amount={amount}
            max={max}
            hasSelect
            balances={isFunding ? balances : currentAccount?.deposits ?? []}
            accountId={!isFunding ? currentAccount?.id ?? '0' : undefined}
          />
          <Divider />
          <Button
            onClick={onConfirm}
            showProgressIndicator={isConfirming}
            className='w-full'
            text={isFunding ? 'Fund' : 'Withdraw'}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary account={currentAccount} change={change} />
      </div>
    </Modal>
  )
}
