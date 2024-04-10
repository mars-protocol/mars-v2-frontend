import { useCallback, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'

import Button from 'components/common/Button'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useWalletBalances from '../../../hooks/useWalletBalances'
import TokenInputWithSlider from '../../common/TokenInput/TokenInputWithSlider'
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
  const chainConfig = useChainConfig()
  const [amount, setAmount] = useState(BN(0))
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const { mutate } = useSWRConfig()

  const maxAmount = useMemo(() => {
    const targetDenom = props.type === 'withdraw' ? props.vault.vaultDenom : props.vault.baseDenom
    const walletBalance = walletBalances?.find((balance) => balance.denom === targetDenom)
    if (!walletBalance) return BN(0)
    return BN(walletBalance.amount).div(props.type === 'withdraw' ? 1e6 : 1)
  }, [props.type, props.vault.baseDenom, props.vault.vaultDenom, walletBalances])

  const onClose = useCallback(() => {
    useStore.setState({ managedVaultModal: null })
  }, [])

  const onConfirm = useCallback(async () => {
    onClose()
    if (props.type === 'withdraw') {
      await useStore.getState().withdrawFromArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vault.vaultDenom, amount.times(1e6)),
        vaultAddress: props.vault.address,
      })
    } else {
      await useStore.getState().depositArbVault({
        coin: BNCoin.fromDenomAndBigNumber(props.vault.baseDenom, amount),
        vaultAddress: props.vault.address,
      })
    }
    await mutate(`chains/${chainConfig.id}/managed-vaults/info`)
    await mutate(`chains/${chainConfig.id}/managed-vaults/info`)
  }, [
    amount,
    chainConfig.id,
    mutate,
    onClose,
    props.type,
    props.vault.address,
    props.vault.baseDenom,
    props.vault.vaultDenom,
  ])

  return (
    <Modal
      onClose={onClose}
      header={
        <div className='flex gap-6 px-6 py-4 border-b border-white/5 gradient-header'>
          {props.type === 'withdraw' ? 'Withdraw from' : 'Deposit into'} Vault
        </div>
      }
      modalClassName='max-w-[400px]'
      contentClassName='gap-6 flex flex-col p-6'
      headerClassName='pr-6 items-center'
    >
      <TokenInputWithSlider
        max={maxAmount}
        asset={props.asset}
        amount={amount}
        onChange={setAmount}
        warningMessages={[]}
        // onDebounce={(amount) => setAmount(amount)}
        disabled={false}
      />
      <Button onClick={onConfirm} className='w-full mt-6'>
        {props.type === 'withdraw' ? 'Withdraw' : 'Deposit'}
      </Button>
    </Modal>
  )
}
