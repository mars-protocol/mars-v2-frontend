import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import { Modal } from 'components/Modal'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'

export default function WithdrawModal() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.withdrawModal)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const [amount, setAmount] = useState(BN(0))
  const [currentAsset, setCurrentAsset] = useState(baseCurrency)

  function onClose() {
    useStore.setState({ withdrawModal: false })
    setAmount(BN(0))
  }

  function onWithdrawClick() {
    console.log('Withdreaw')
  }

  const maxWithdraw = currentAccount
    ? getAmount(currentAsset.denom, currentAccount.deposits)
    : BN(0)

  return (
    <Modal
      open={!!(modal && currentAccount)}
      onClose={onClose}
      header={
        !!(modal && currentAccount) && (
          <span className='flex items-center gap-4 px-4'>
            <Text>{`Withdraw from Account ${currentAccount.id}`}</Text>
          </span>
        )
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      {modal && (
        <div className='flex flex-grow items-start gap-6 p-6'>
          <Card
            className='w-full bg-white/5 p-4'
            contentClassName='gap-6 flex flex-col justify-between h-full'
          >
            <TokenInputWithSlider
              asset={currentAsset}
              onChange={(val) => {
                setAmount(val)
              }}
              amount={amount}
              max={maxWithdraw}
              hasSelect
            />
            <Divider />
            <Button
              onClick={onWithdrawClick}
              className='w-full'
              text='Withdraw'
              rightIcon={<ArrowRight />}
            />
          </Card>
          <AccountSummary />
        </div>
      )}
    </Modal>
  )
}
