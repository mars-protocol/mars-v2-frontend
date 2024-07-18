import { useCallback } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import AstroLpModalContent from 'components/Modals/AstroLp/AstroLpModalContent'
import AstroLpModalContentHeader from 'components/Modals/AstroLp/AstroLpModalContentHeader'
import AstroLpWithdraw from 'components/Modals/AstroLp/AstroLpWithdraw'
import Modal from 'components/Modals/Modal'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'

export default function AstroLpModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.astroLpModal)

  if (!modal || !currentAccount) return null

  return <AstroLpModal currentAccount={currentAccount} modal={modal} />
}

interface Props {
  currentAccount: Account
  modal: AstroLpModal
}

function AstroLpModal(props: Props) {
  const {
    modal: { astroLp, action },
    currentAccount,
  } = props

  const onClose = useCallback(() => {
    useStore.setState({ astroLpModal: null })
  }, [])

  const ContentComponent = useCallback(() => {
    switch (action) {
      case 'deposit':
        return <AstroLpModalContent astroLp={astroLp} account={currentAccount} />
      case 'withdraw':
        return <AstroLpWithdraw account={currentAccount} astroLp={astroLp as DepositedAstroLp} />
      default:
        return null
    }
  }, [currentAccount, astroLp, action])

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center py-1 pr-4'>
          <DoubleLogo
            primaryDenom={astroLp.denoms.primary}
            secondaryDenom={astroLp.denoms.secondary}
          />
          <Text className='pl-3 pr-2'>{astroLp.name}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <AstroLpModalContentHeader astroLp={astroLp} account={currentAccount} />
      <ContentComponent />
    </Modal>
  )
}
