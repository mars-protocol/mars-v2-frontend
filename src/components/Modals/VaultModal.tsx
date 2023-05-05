import BigNumber from 'bignumber.js'
import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import VaultLogo from 'components/Earn/vault/VaultLogo'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import { Modal } from 'components/Modal'
import Slider from 'components/Slider'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { getAmount } from 'utils/accounts'
import { formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function VaultModal() {
  const modal = useStore((s) => s.vaultModal)
  const [amount, setAmount] = useState(BN(0))
  const [percentage, setPercentage] = useState(0)
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const currentAccount = useCurrentAccount()

  function handleSwitch() {
    setIsCustomAmount(() => !isCustomAmount)
  }

  function onClose() {
    useStore.setState({ vaultModal: null })
    setAmount(BN(0))
    setPercentage(0)
  }

  function onChangeSlider(value: number) {}
  function onChangePrimary(value: BigNumber) {}
  function onChangeSecondary(value: BigNumber) {}

  const primaryAsset = ASSETS.find((asset) => asset.denom === modal?.vault.denoms.primary)
  const secondaryAsset = ASSETS.find((asset) => asset.denom === modal?.vault.denoms.secondary)

  const isValid = primaryAsset && currentAccount && secondaryAsset
  const primaryMaxAmount = isValid ? getAmount(primaryAsset.denom, currentAccount.deposits) : BN(0)
  const secondaryMaxAmount = isValid
    ? getAmount(secondaryAsset.denom, currentAccount.deposits)
    : BN(0)

  return (
    <Modal
      open={!!(modal && isValid)}
      onClose={onClose}
      header={
        modal && (
          <span className='flex items-center gap-4 px-4'>
            <VaultLogo vault={modal.vault} />
            <Text>{`${modal.vault.symbols.primary} - ${modal.vault.symbols.secondary}`}</Text>
          </span>
        )
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      {modal && isValid && (
        <>
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
        </>
      )}
    </Modal>
  )
}
