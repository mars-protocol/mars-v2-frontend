import { CircularProgress } from 'components/CircularProgress'
import Modal from 'components/Modal'
import FundWithdrawModalContent from 'components/Modals/FundWithdraw/FundAndWithdrawModalContent'
import Text from 'components/Text'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export default function FundAndWithdrawModal() {
  const currentAccount = useCurrentAccount()
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const isFunding = modal === 'fund'

  function onClose() {
    useStore.setState({ fundAndWithdrawModal: null })
  }

  if (!modal) return null
  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          <Text>
            {isFunding
              ? `Fund Account ${currentAccount?.id ?? '0'}`
              : `Withdraw from Account ${currentAccount?.id ?? '0'}`}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col min-h-[400px]'
    >
      {modal && currentAccount ? (
        <FundWithdrawModalContent account={currentAccount} isFunding={isFunding} />
      ) : (
        <CircularProgress />
      )}
    </Modal>
  )
}
