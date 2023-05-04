import Image from 'next/image'
import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import { Modal } from 'components/Modal'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'
import { formatPercent, formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import useParams from 'utils/route'

export default function BorrowModal() {
  const params = useParams()
  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState(BN(0))
  const [selectedAccount, setSelectedAccount] = useState(params.accountId)
  const modal = useStore((s) => s.borrowModal)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const accounts = useStore((s) => s.accounts)?.map((account) => {
    return account.id
  })

  function onAccountSelect(accountId: string) {
    setSelectedAccount(accountId)
  }

  function onConfirmClick() {
    if (!modal?.asset) return
    if (modal.isRepay) {
      repay({
        fee: hardcodedFee,
        accountId: selectedAccount,
        coin: { denom: modal.asset.denom, amount: amount.toString() },
        accountBalance: percentage === 100,
      })
      return
    }

    borrow({
      fee: hardcodedFee,
      accountId: selectedAccount,
      coin: { denom: modal.asset.denom, amount: amount.toString() },
    })
  }

  function onClose() {
    useStore.setState({ borrowModal: null })
    setAmount(BN(0))
    setPercentage(0)
  }

  const liquidityAmount = Number(modal?.marketData.liquidity?.amount || 0)
  const liquidityAmountString: string = formatValue(liquidityAmount, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValue = Number(modal?.marketData.liquidity?.value || 0)
  const liquidityValueString: string = formatValue(liquidityValue, {
    abbreviated: true,
    decimals: 6,
  })

  let debtAmount = '0'

  if ((modal?.marketData as BorrowAssetActive)?.debt)
    debtAmount = BN((modal?.marketData as BorrowAssetActive).debt).toString()

  const max = BN(modal?.isRepay ? debtAmount : liquidityAmount)

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        modal && (
          <span className='flex items-center gap-4 px-4'>
            <Image src={modal.asset.logo} alt={modal.asset.symbol} width={24} height={24} />

            <Text>
              {modal.isRepay ? 'Repay' : 'Borrow'} {modal.asset.symbol}
            </Text>
          </span>
        )
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      {modal && (
        <>
          <div className='flex gap-3 border-b border-b-white/5 px-6 py-4 gradient-header'>
            <TitleAndSubCell
              title={formatPercent(modal.marketData.borrowRate || '0')}
              sub={'Borrow rate'}
            />
            <div className='h-100 w-[1px] bg-white/10'></div>
            <TitleAndSubCell
              title={formatValue(debtAmount, { abbreviated: true, decimals: modal.asset.decimals })}
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
              className='w-full bg-white/5 p-4'
              contentClassName='gap-6 flex flex-col justify-between h-full'
            >
              <TokenInputWithSlider
                asset={modal.asset}
                onChange={(val) => {
                  setAmount(val)
                }}
                amount={amount}
                max={max}
              />
              <Divider />
              <Text size='lg'>{modal.isRepay ? 'Repay for' : 'Borrow to'}</Text>
              <select
                name='account'
                value={selectedAccount}
                onChange={(e) => onAccountSelect(e.target.value)}
                className='rounded-base border border-white/10 bg-white/5 p-4'
              >
                {accounts?.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
              <Button
                onClick={onConfirmClick}
                className='w-full'
                text={modal.isRepay ? 'Repay' : 'Borrow'}
                rightIcon={<ArrowRight />}
              />
            </Card>
            <AccountSummary />
          </div>
        </>
      )}
    </Modal>
  )
}
