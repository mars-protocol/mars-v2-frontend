import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatPercent, formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

function getDebtAmount(modal: BorrowModal | null) {
  return BN((modal?.marketData as BorrowMarketTableData)?.debt ?? 0).toString()
}

function getAssetLogo(modal: BorrowModal | null) {
  if (!modal?.asset) return null
  return <AssetImage asset={modal.asset} size={24} />
}

interface Props {
  account: Account
}

export default function BorrowModalController() {
  const account = useCurrentAccount()
  if (!account) return null

  return <BorrowModal account={account} />
}

function BorrowModal(props: Props) {
  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState(BN_ZERO)
  const [change, setChange] = useState<AccountChange | undefined>()
  const [isConfirming, setIsConfirming] = useToggle()
  const [borrowToWallet, setBorrowToWallet] = useToggle()
  const modal = useStore((s) => s.borrowModal)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal?.asset ?? ASSETS[0]
  const isRepay = modal?.isRepay ?? false
  const [max, setMax] = useState(BN_ZERO)

  const { computeMaxBorrowAmount } = useHealthComputer(props.account)

  function resetState() {
    setAmount(BN_ZERO)
    setPercentage(0)
    setIsConfirming(false)
  }

  async function onConfirmClick() {
    if (!modal?.asset) return
    setIsConfirming(true)
    let result
    if (isRepay) {
      result = await repay({
        accountId: props.account.id,
        coin: BNCoin.fromDenomAndBigNumber(modal.asset.denom, amount),
        accountBalance: percentage === 100,
      })
    } else {
      result = await borrow({
        accountId: props.account.id,
        coin: { denom: modal.asset.denom, amount: amount.toString() },
        borrowToWallet,
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

  const liquidityAmountString = formatValue(modal?.marketData?.liquidity?.amount.toString() || 0, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValueString = formatValue(modal?.marketData?.liquidity?.value.toString() || 0, {
    abbreviated: true,
    decimals: 6,
  })

  useEffect(() => {
    if (isRepay) {
      setMax(BN(getDebtAmount(modal)))
      return
    }

    const maxBorrowAmount = computeMaxBorrowAmount(
      asset.denom,
      borrowToWallet ? 'wallet' : 'deposit',
    )

    setMax(BigNumber.min(maxBorrowAmount, modal?.marketData?.liquidity?.amount || 0))
  }, [isRepay, modal, asset.denom, computeMaxBorrowAmount, borrowToWallet])

  useEffect(() => {
    if (!modal?.asset) return

    setChange({
      deposits: [
        {
          amount: isRepay ? BN_ZERO.minus(amount).toString() : BN_ZERO.plus(amount).toString(),
          denom: modal.asset.denom,
        },
      ],
      debts: [
        {
          amount: isRepay ? BN_ZERO.minus(amount).toString() : BN_ZERO.plus(amount).toString(),
          denom: modal.asset.denom,
        },
      ],
    })
  }, [amount, modal?.asset, props.account, isRepay])

  if (!modal) return null
  return (
    <Modal
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
      <div className='flex gap-3 px-6 py-4 border-b border-white/5 gradient-header'>
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
      <div className='flex items-start flex-1 gap-6 p-6'>
        <Card
          className='flex flex-1 p-4 bg-white/5'
          contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
        >
          <div className='flex flex-wrap w-full'>
            <TokenInputWithSlider
              asset={asset}
              onChange={setAmount}
              amount={amount}
              max={max}
              className='w-full'
              maxText='Max'
              disabled={isConfirming}
            />
            {!isRepay && (
              <>
                <Divider className='my-6' />
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full mb-1'>Receive funds to Wallet</Text>
                  <Text size='xs' className='text-white/50'>
                    Your borrowed funds will directly go to your wallet
                  </Text>
                </div>
                <div className='flex flex-wrap items-center justify-end'>
                  <Switch
                    name='borrow-to-wallet'
                    checked={borrowToWallet}
                    onChange={setBorrowToWallet}
                    disabled={isConfirming}
                  />
                </div>
              </>
            )}
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
        <AccountSummary account={props.account} change={change} />
      </div>
    </Modal>
  )
}
