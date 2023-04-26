import { useState } from 'react'
import BigNumber from 'bignumber.js'

import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { formatValue } from 'utils/formatters'
import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import { Button } from 'components/Button'
import Divider from 'components/Divider'
import TokenInput from 'components/TokenInput'
import { ArrowRight } from 'components/Icons'
import useStore from 'store'
import { Modal } from 'components/Modal'
import { ASSETS } from 'constants/assets'
import Switch from 'components/Switch'
import { FormattedNumber } from 'components/FormattedNumber'
import Slider from 'components/Slider'
import useParams from 'utils/route'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'

import VaultLogo from './VaultLogo'

export default function VaultModal() {
  const modal = useStore((s) => s.vaultModal)
  const accounts = useStore((s) => s.accounts)
  const params = useParams()
  const [amount, setAmount] = useState(BN(0))
  const [percentage, setPercentage] = useState(0)
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const currentAccount = accounts?.find((account) => account.id === params.accountId)

  function handleSwitch() {
    setIsCustomAmount(() => !isCustomAmount)
  }

  function setOpen(isOpen: boolean) {
    useStore.setState({ vaultModal: null })
  }

  function onChangeSlider(value: number) {}
  function onChangePrimary(value: BigNumber) {}
  function onChangeSecondary(value: BigNumber) {}

  if (!modal || !currentAccount) return null

  const primaryAsset = ASSETS.find((asset) => asset.denom === modal.vault.denoms.primary)
  const secondaryAsset = ASSETS.find((asset) => asset.denom === modal.vault.denoms.secondary)

  if (!primaryAsset || !secondaryAsset) return null

  const primaryMaxAmount = getAmount(primaryAsset.denom, currentAccount.deposits)
  const secondaryMaxAmount = getAmount(secondaryAsset.denom, currentAccount.deposits)

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      header={
        <span className='flex items-center gap-4 px-4'>
          <VaultLogo vault={modal.vault} />
          <Text>{`${modal.vault.symbols.primary} - ${modal.vault.symbols.secondary}`}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex gap-3 border-b border-b-white/5 px-6 py-4 gradient-header'>
        <TitleAndSubCell
          title={formatValue(1000000, { abbreviated: true, decimals: 6 })}
          sub={'Borrowed'}
        />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell title={`${1000} (${10000})`} sub={'Liquidity available'} />
      </div>
      <div className='flex flex-grow items-start gap-6 p-6'>
        <Card
          className='w-full bg-white/5 p-4'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          <TokenInput
            onChange={onChangePrimary}
            amount={amount}
            max={primaryMaxAmount}
            asset={primaryAsset}
          />
          <Slider value={percentage} onChange={onChangeSlider} />
          <TokenInput
            onChange={onChangeSecondary}
            amount={amount}
            max={secondaryMaxAmount}
            asset={secondaryAsset}
          />
          <Divider />
          <div className='flex justify-between'>
            <Text className='text-white/50'>Custom amount</Text>
            <Switch checked={isCustomAmount} onChange={handleSwitch} name='customAmount' />
          </div>
          <div className='flex justify-between'>
            <Text className='text-white/50'>{`${modal.vault.symbols.primary}-${modal.vault.symbols.secondary} Position Value`}</Text>
            <FormattedNumber amount={0} options={{ prefix: '$' }} />
          </div>
          <Button
            onClick={() => {}}
            className='w-full'
            text='Continue'
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary />
      </div>
    </Modal>
  )
}
