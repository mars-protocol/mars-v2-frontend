import { useCallback } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import AstroLpWithdraw from 'components/Modals/AstroLp/AstroLpWithdraw'
import FarmModalContent from 'components/Modals/Farm/FarmModalContent'
import FarmModalContentHeader from 'components/Modals/Farm/FarmModalContentHeader'
import Modal from 'components/Modals/Modal'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'

export default function AstroLpModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.farmModal)

  if (!modal || !currentAccount || modal.type !== 'astroLp') return null

  return <AstroLpModal currentAccount={currentAccount} modal={modal} />
}

interface Props {
  currentAccount: Account
  modal: FarmModal
}

function AstroLpModal(props: Props) {
  const {
    modal: { farm, action },
    currentAccount,
  } = props
  const astroLp = farm as AstroLp
  const onClose = useCallback(() => {
    useStore.setState({ farmModal: null })
  }, [])

  const ContentComponent = useCallback(() => {
    switch (action) {
      case 'deposit':
        return <FarmModalContent farm={astroLp} account={currentAccount} isAstroLp={true} />
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
      <FarmModalContentHeader farm={astroLp} account={currentAccount} isAstroLp={true} />
      <ContentComponent />
    </Modal>
  )
}
