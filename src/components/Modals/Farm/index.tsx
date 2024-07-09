import { useCallback } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import FarmModalContent from 'components/Modals/Farm/FarmModalContent'
import FarmModalContentHeader from 'components/Modals/Farm/FarmModalContentHeader'
import FarmWithdraw from 'components/Modals/Farm/FarmWithdraw'
import Modal from 'components/Modals/Modal'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'

export default function FarmModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.farmModal)

  if (!modal || !currentAccount) return null

  return <FarmModal currentAccount={currentAccount} modal={modal} />
}

interface Props {
  currentAccount: Account
  modal: FarmModal
}

function FarmModal(props: Props) {
  const {
    modal: { farm, action },
    currentAccount,
  } = props

  const onClose = useCallback(() => {
    useStore.setState({ farmModal: null })
  }, [])

  const ContentComponent = useCallback(() => {
    switch (action) {
      case 'deposit':
        return <FarmModalContent farm={farm} account={currentAccount} />
      case 'withdraw':
        return <FarmWithdraw account={currentAccount} farm={farm as DepositedFarm} />
      default:
        return null
    }
  }, [currentAccount, farm, action])

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center py-1 pr-4'>
          <DoubleLogo primaryDenom={farm.denoms.primary} secondaryDenom={farm.denoms.secondary} />
          <Text className='pl-3 pr-2'>{farm.name}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <FarmModalContentHeader farm={farm} account={currentAccount} />
      <ContentComponent />
    </Modal>
  )
}
