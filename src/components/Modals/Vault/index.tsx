import moment from 'moment'
import { useCallback, useMemo } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import FarmModalContent from 'components/Modals/Farm/FarmModalContent'
import FarmModalContentHeader from 'components/Modals/Farm/FarmModalContentHeader'
import Modal from 'components/Modals/Modal'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useStore from 'store'

export default function VaultModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.farmModal)

  if (!modal || !currentAccount || modal.type !== 'vault') return null

  return <VaultModal currentAccount={currentAccount} modal={modal} />
}

interface Props {
  currentAccount: Account
  modal: FarmModal
}

function VaultModal(props: Props) {
  const {
    modal: { farm, isDeposited },
    currentAccount,
  } = props
  const vault = farm as Vault

  const onClose = useCallback(() => {
    useStore.setState({ farmModal: null })
  }, [])

  const unlockTime = useMemo(() => {
    if ('unlocksAt' in vault && vault.unlocksAt) {
      return moment(vault.unlocksAt)
    }
  }, [vault])

  const { addedDebts, removedDeposits, removedLends, simulateVaultDeposit } =
    useUpdatedAccount(currentAccount)

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center py-1 pr-4'>
          <DoubleLogo primaryDenom={vault.denoms.primary} secondaryDenom={vault.denoms.secondary} />
          <Text className='pl-3 pr-2'>{vault.name}</Text>
          {unlockTime && (
            <Tooltip
              content={`Account position for this vault unlocks at ${unlockTime}`}
              type={'info'}
            >
              <div className='w-4 h-4'>
                <InfoCircle />
              </div>
            </Tooltip>
          )}
        </span>
      }
      headerClassName='bg-surface-dark pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <FarmModalContentHeader farm={vault} isAstroLp={false} account={currentAccount} />
      <FarmModalContent
        farm={vault}
        account={currentAccount}
        isDeposited={isDeposited}
        isAstroLp={false}
        addedDebts={addedDebts}
        removedDeposits={removedDeposits}
        removedLends={removedLends}
        simulateVaultDeposit={simulateVaultDeposit}
        type='vault'
      />
    </Modal>
  )
}
