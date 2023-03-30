import Image from 'next/image'
import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'

import { Modal } from 'components/Modal'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useStore from 'store'
import { Text } from 'components/Text'
import { formatPercent, formatValue } from 'utils/formatters'
import Slider from 'components/Slider'
import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import Divider from 'components/Divider'
import TokenInput from 'components/TokenInput'
import { Button } from 'components/Button'
import { ArrowRight } from 'components/Icons'
import useParams from 'hooks/useParams'
import { hardcodedFee } from 'utils/contants'

export default function BorrowModal() {
  const params = useParams()
  const [percentage, setPercentage] = useState(0)
  const [value, setValue] = useState(0)
  const [selectedAccount, setSelectedAccount] = useState(params.account)
  const modal = useStore((s) => s.borrowModal)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const creditAccounts = useStore((s) => s.creditAccounts)

  function onAccountSelect(accountId: string) {
    setSelectedAccount(accountId)
  }

  function setOpen(isOpen: boolean) {
    useStore.setState({ borrowModal: null })
    setValue(0)
    setPercentage(0)
  }

  function onConfirmClick() {
    if (!modal?.asset) return

    const amount = new BigNumber(value).shiftedBy(modal.asset.decimals)

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

  const onSliderChange = useCallback(
    (percentage: number, maxAmount: number) => {
      const amount = new BigNumber(percentage).div(100).times(maxAmount).toNumber()

      setValue(amount)
      setPercentage(percentage)
    },
    [modal?.asset.decimals],
  )

  const onInputChange = useCallback(
    (value: number, maxAmount: number) => {
      setValue(value)
      setPercentage(new BigNumber(value).div(maxAmount).times(100).toNumber())
    },
    [modal?.asset.decimals],
  )

  if (!modal) return null

  const liquidityAmount = Number(modal.marketData.liquidity?.amount || 0)
  const liquidityAmountString: string = formatValue(liquidityAmount, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValue = Number(modal.marketData.liquidity?.value || 0)
  const liquidityValueString: string = formatValue(liquidityValue, {
    abbreviated: true,
    decimals: 6,
  })

  let debtAmount = 0

  if ((modal.marketData as BorrowAssetActive)?.debt)
    debtAmount = Number((modal.marketData as BorrowAssetActive).debt)

  const maxAmount = new BigNumber(modal.isRepay ? debtAmount : liquidityAmount)
    .shiftedBy(-modal.asset.decimals)
    .toNumber()

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      header={
        <span className='flex items-center gap-4 px-4'>
          <Image src={modal?.asset.logo} alt='token' width={24} height={24} />
          <Text>
            {modal.isRepay ? 'Repay' : 'Borrow'} {modal.asset.symbol}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
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
          <TokenInput
            asset={modal.asset}
            onChange={(value) => onInputChange(value, maxAmount)}
            value={value}
            max={maxAmount}
          />
          <Slider value={percentage} onChange={(value) => onSliderChange(value, maxAmount)} />
          <Divider />
          <Text size='lg'>{modal.isRepay ? 'Repay for' : 'Borrow to'}</Text>
          <select
            name='creditAccount'
            value={selectedAccount}
            onChange={(e) => onAccountSelect(e.target.value)}
            className='rounded-base border border-white/10 bg-white/5 p-4'
          >
            {creditAccounts?.map((account) => (
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
    </Modal>
  )
}
