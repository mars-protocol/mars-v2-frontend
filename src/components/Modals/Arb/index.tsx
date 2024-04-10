import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import useAsset from 'hooks/assets/useAsset'
import useArbVault from 'hooks/vaults/useArbVault'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useWalletBalances from '../../../hooks/useWalletBalances'
import AssetAmountInput from '../../trade/TradeModule/SwapForm/AssetAmountInput'
import Modal from '../Modal'

export default function ArbModalController() {
  const modal = useStore((s) => s.arbModal)
  const { data: arbVault } = useArbVault()
  const asset = useAsset(arbVault?.denoms.primary ?? '')
  if (!modal || !asset || !arbVault) return null
  return (
    <ArbModal
      asset={asset}
      type={modal.type}
      vaultBaseDenom={arbVault.denoms.primary}
      vaultAddress={arbVault.address}
      vaultToken={arbVault.denoms.vault}
    />
  )
}

type Props = {
  asset: Asset
  type: 'deposit' | 'withdraw'
  vaultBaseDenom: string
  vaultAddress: string
  vaultToken: string
}
function ArbModal(props: Props) {
  const [amount, setAmount] = useState(BN(0))
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  const maxAmount = useMemo(() => {
    const targetDenom = props.type === 'withdraw' ? props.vaultToken : props.vaultBaseDenom
    const walletBalance = walletBalances?.find((balance) => balance.denom === targetDenom)
    if (!walletBalance) return BN(0)
    return BN(walletBalance.amount)
  }, [props.type, props.vaultBaseDenom, props.vaultToken, walletBalances])

  const onClose = useCallback(() => {
    useStore.setState({ arbModal: null })
  }, [])

  const onConfirm = useCallback(() => {
    if (props.type === 'withdraw') {
      useStore.getState().withdrawFromArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vaultToken, amount),
        vaultAddress: props.vaultAddress,
      })
    } else {
      useStore.getState().depositArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vaultBaseDenom, amount),
        vaultAddress: props.vaultAddress,
      })
    }
    onClose()
  }, [amount, onClose, props.vaultAddress, props.vaultBaseDenom])

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
        Deposit
      </Button>
    </Modal>
  )
}
