import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import useAsset from 'hooks/assets/useAsset'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useWalletBalances from '../../../hooks/useWalletBalances'
import AssetAmountInput from '../../trade/TradeModule/SwapForm/AssetAmountInput'
import Modal from '../Modal'

export default function ArbModalController() {
  const modal = useStore((s) => s.managedVaultModal)

  const asset = useAsset(modal?.vault?.baseDenom ?? '')
  if (!modal || !asset || !modal.vault) return null
  return <ArbModal asset={asset} type={modal.type} vault={modal.vault} />
}

type Props = {
  asset: Asset
  type: 'deposit' | 'withdraw'
  vault: ManagedVault
}
function ArbModal(props: Props) {
  const [amount, setAmount] = useState(BN(0))
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  const maxAmount = useMemo(() => {
    const targetDenom = props.type === 'withdraw' ? props.vault.vaultDenom : props.vault.baseDenom
    const walletBalance = walletBalances?.find((balance) => balance.denom === targetDenom)
    if (!walletBalance) return BN(0)
    return BN(walletBalance.amount)
  }, [props.type, props.vault.baseDenom, props.vault.vaultDenom, walletBalances])

  const onClose = useCallback(() => {
    useStore.setState({ managedVaultModal: null })
  }, [])

  const onConfirm = useCallback(() => {
    if (props.type === 'withdraw') {
      useStore.getState().withdrawFromArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vault.vaultDenom, amount),
        vaultAddress: props.vault.address,
      })
    } else {
      useStore.getState().depositArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vault.baseDenom, amount),
        vaultAddress: props.vault.address,
      })
    }
    onClose()
  }, [amount, onClose, props.vault.address, props.vault.baseDenom])

  return (
    <Modal
      onClose={onClose}
      header={`${props.type === 'withdraw' ? 'Withdraw from' : 'Deposit into'} Vault`}
      className='p-6'
      modalClassName='max-w-[400px]'
      contentClassName='gap-6 flex flex-col'
    >
      <AssetAmountInput
        max={maxAmount}
        asset={props.asset}
        amount={amount}
        maxButtonLabel={'Max'}
        setAmount={setAmount}
        disabled={false}
      />
      <Button onClick={onConfirm} className='w-full'>
        {props.type === 'withdraw' ? 'Withdraw' : 'Deposit'}
      </Button>
    </Modal>
  )
}
