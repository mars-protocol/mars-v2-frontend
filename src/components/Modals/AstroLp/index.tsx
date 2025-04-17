import { useCallback } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import HlsTag from 'components/hls/HlsTag'
import AstroLpWithdraw from 'components/Modals/AstroLp/AstroLpWithdraw'
import FarmModalContent from 'components/Modals/Farm/FarmModalContent'
import FarmModalContentHeader from 'components/Modals/Farm/FarmModalContentHeader'
import Modal from 'components/Modals/Modal'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useStore from 'store'

export default function AstroLpModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.farmModal)

  if (!modal || modal.type === 'vault') return null

  const account = modal.type == 'high_leverage' ? modal.account : currentAccount

  if (!account) return null
  return <AstroLpModal currentAccount={account} modal={modal} />
}

interface Props {
  currentAccount: Account
  modal: FarmModal
}

function AstroLpModal(props: Props) {
  const {
    modal: { farm, action, type, isCreate },
    currentAccount,
  } = props
  const isHls = currentAccount.kind === 'high_levered_strategy'
  const astroLp = farm as AstroLp
  const onClose = useCallback(() => {
    useStore.setState({ farmModal: null })
  }, [])

  const {
    addedDebts,
    removedDeposits,
    removedLends,
    simulateAstroLpDeposit,
    simulateUnstakeAstroLp,
  } = useUpdatedAccount(currentAccount)

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-3 py-1 pr-4'>
          <DoubleLogo
            primaryDenom={astroLp.denoms.primary}
            secondaryDenom={astroLp.denoms.secondary}
          />
          <Text>{astroLp.name}</Text>
          {isHls && <HlsTag />}
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <FarmModalContentHeader farm={astroLp} account={currentAccount} isAstroLp />
      {action === 'deposit' ? (
        <FarmModalContent
          farm={astroLp}
          account={currentAccount}
          isAstroLp
          addedDebts={addedDebts}
          removedDeposits={removedDeposits}
          removedLends={removedLends}
          simulateAstroLpDeposit={simulateAstroLpDeposit}
          type={type}
          isDeposited={!isCreate}
        />
      ) : (
        <AstroLpWithdraw
          account={currentAccount}
          simulateUnstakeAstroLp={simulateUnstakeAstroLp}
          astroLp={astroLp as DepositedAstroLp}
        />
      )}
    </Modal>
  )
}
