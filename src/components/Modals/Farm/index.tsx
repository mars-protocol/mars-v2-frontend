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
import useAsset from 'hooks/assets/useAsset'
import useStore from 'store'

export default function FarmModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.farmModal)

  const primaryAsset = useAsset(modal?.farm.denoms.primary || '')
  const secondaryAsset = useAsset(modal?.farm.denoms.secondary || '')

  if (!modal || !currentAccount || !primaryAsset || !secondaryAsset) return null

  return (
    <FarmModal
      currentAccount={currentAccount}
      modal={modal}
      primaryAsset={primaryAsset}
      secondaryAsset={secondaryAsset}
    />
  )
}

interface Props {
  currentAccount: Account
  modal: FarmModal
  primaryAsset: Asset
  secondaryAsset: Asset
}

function FarmModal(props: Props) {
  const {
    modal: { farm, isDeposited },
    primaryAsset,
    secondaryAsset,
    currentAccount,
  } = props

  const onClose = useCallback(() => {
    useStore.setState({ farmModal: null })
  }, [])

  const unlockTime = useMemo(() => {
    if ('unlocksAt' in farm && farm.unlocksAt) {
      return moment(farm.unlocksAt)
    }
  }, [farm])

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center py-1 pr-4'>
          <DoubleLogo primaryDenom={farm.denoms.primary} secondaryDenom={farm.denoms.secondary} />
          <Text className='pl-3 pr-2'>{farm.name}</Text>
          {unlockTime && (
            <Tooltip
              content={`Account position for this farm unlocks at ${unlockTime}`}
              type={'info'}
            >
              <div className='w-4 h-4'>
                <InfoCircle />
              </div>
            </Tooltip>
          )}
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <FarmModalContentHeader farm={farm} />
      <FarmModalContent
        farm={farm}
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        account={currentAccount}
        isDeposited={isDeposited}
      />
    </Modal>
  )
}
