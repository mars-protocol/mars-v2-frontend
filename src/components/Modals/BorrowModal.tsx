import Image from 'next/image'
import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'
import { formatPercent, formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import useParams from 'utils/route'

function getDebtAmount(modal: BorrowModal | null) {
  if (!(modal?.marketData as BorrowAssetActive)?.debt) return '0'
  return BN((modal?.marketData as BorrowAssetActive).debt).toString()
}

function getAssetLogo(modal: BorrowModal | null) {
  if (!modal?.asset) return null
  return <Image src={modal.asset.logo} alt={modal.asset.symbol} width={24} height={24} />
}

export default function BorrowModal() {
  const params = useParams()
  const currentAccount = useCurrentAccount()
  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState(BN(0))
  const [selectedAccount, setSelectedAccount] = useState(params.accountId)
  const modal = useStore((s) => s.borrowModal)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal?.asset ?? ASSETS[0]
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

  const liquidityAmountString = formatValue(modal?.marketData?.liquidity?.amount || 0, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValueString = formatValue(modal?.marketData?.liquidity?.value || 0, {
    abbreviated: true,
    decimals: 6,
  })

  const max = BN(modal?.isRepay ? getDebtAmount(modal) : liquidityAmountString)

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          {getAssetLogo(modal)}
          <Text>
            {modal?.isRepay ? 'Repay' : 'Borrow'} {asset.symbol}
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
          className='w-full bg-white/5 p-4'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          <TokenInputWithSlider
            asset={asset}
            onChange={(val) => {
              setAmount(val)
            }}
            amount={amount}
            max={max}
          />
          <Divider />
          <Text size='lg'>{modal?.isRepay ? 'Repay for' : 'Borrow to'}</Text>
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
            text={modal?.isRepay ? 'Repay' : 'Borrow'}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary account={currentAccount} />
      </div>
    </Modal>
  )
}
