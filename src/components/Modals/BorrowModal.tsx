'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'
import { formatPercent, formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

function getDebtAmount(modal: BorrowModal | null) {
  if (!(modal?.marketData as BorrowAssetActive)?.debt) return '0'
  return BN((modal?.marketData as BorrowAssetActive).debt).toString()
}

function getAssetLogo(modal: BorrowModal | null) {
  if (!modal?.asset) return null
  return <Image src={modal.asset.logo} alt={modal.asset.symbol} width={24} height={24} />
}

export default function BorrowModal() {
  const currentAccount = useCurrentAccount()
  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState(BN(0))
  const [change, setChange] = useState<AccountChange | undefined>()
  const [selectedAccount, setSelectedAccount] = useState(currentAccount)
  const [isConfirming, setIsConfirming] = useToggle()
  const modal = useStore((s) => s.borrowModal)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal?.asset ?? ASSETS[0]
  const accounts = useStore((s) => s.accounts)
  const accountOptions = accounts?.map((account) => {
    return { value: account.id, label: `Account ${account.id}` }
  })
  const isRepay = modal?.isRepay ?? false

  function resetState() {
    setAmount(BN(0))
    setPercentage(0)
    setIsConfirming(false)
  }

  async function onConfirmClick() {
    if (!modal?.asset) return
    setIsConfirming(true)
    let result
    if (isRepay) {
      result = await repay({
        fee: hardcodedFee,
        accountId: selectedAccount?.id ?? '0',
        coin: { denom: modal.asset.denom, amount: amount.toString() },
        accountBalance: percentage === 100,
      })
    } else {
      result = await borrow({
        fee: hardcodedFee,
        accountId: selectedAccount?.id ?? '0',
        coin: { denom: modal.asset.denom, amount: amount.toString() },
      })
    }

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ borrowModal: null })
    }
  }

  function onClose() {
    resetState()
    useStore.setState({ borrowModal: null })
  }

  const liquidityAmountString = formatValue(modal?.marketData?.liquidity?.amount || 0, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValueString = formatValue(modal?.marketData?.liquidity?.value || 0, {
    abbreviated: true,
    decimals: 6,
  })

  const max = BN(isRepay ? getDebtAmount(modal) : modal?.marketData?.liquidity?.amount ?? '0')

  useEffect(() => {
    if (!selectedAccount) setSelectedAccount(currentAccount)
  }, [selectedAccount, currentAccount])

  useEffect(() => {
    if (!modal?.asset) return

    setChange({
      deposits: [
        {
          amount: isRepay ? BN(0).minus(amount).toString() : BN(0).plus(amount).toString(),
          denom: modal.asset.denom,
        },
      ],
      debts: [
        {
          amount: isRepay ? BN(0).minus(amount).toString() : BN(0).plus(amount).toString(),
          denom: modal.asset.denom,
        },
      ],
    })
  }, [amount, modal?.asset, currentAccount, isRepay])

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          {getAssetLogo(modal)}
          <Text>
            {isRepay ? 'Repay' : 'Borrow'} {asset.symbol}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex gap-3 border-b border-b-white/5 px-6 py-4 gradient-header'>
        <TitleAndSubCell
          title={formatPercent(modal?.marketData.borrowRate || '0')}
          sub={'Borrow rate'}
        />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell
          title={formatValue(getDebtAmount(modal), {
            abbreviated: true,
            decimals: asset.decimals,
          })}
          sub={'Borrowed'}
        />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell
          title={`${liquidityAmountString} (${liquidityValueString})`}
          sub={'Liquidity available'}
        />
      </div>
      <div className='flex flex-grow items-start gap-6 p-6'>
        <Card
          className='flex flex-grow bg-white/5 p-4'
          contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
        >
          <div className='flex w-full flex-wrap'>
            <TokenInputWithSlider
              asset={asset}
              onChange={setAmount}
              amount={amount}
              max={max}
              className='w-full'
            />
            <Divider className='my-6' />
            <Text size='lg' className='pb-2'>
              {isRepay ? 'Repay for' : 'Borrow to'}
            </Text>
            <div className='relative flex w-full'>
              <Select
                options={accountOptions ?? []}
                title='Accounts'
                defaultValue={selectedAccount?.id}
                onChange={(account) => {
                  accounts && setSelectedAccount(accounts?.find((a) => a.id === account))
                }}
                className='w-full rounded-base border border-white/10 bg-white/5'
              />
            </div>
          </div>
          <Button
            onClick={onConfirmClick}
            className='w-full'
            showProgressIndicator={isConfirming}
            disabled={amount.isZero()}
            text={isRepay ? 'Repay' : 'Borrow'}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary account={selectedAccount} change={change} />
      </div>
    </Modal>
  )
}
