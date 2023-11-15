import FundWithdrawModalContent from 'components/Modals/FundWithdraw/FundAndWithdrawModalContent'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import Text from 'components/Text'
import useAccount from 'hooks/useAccount'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'

export default function FundAndWithdrawModal() {
  const accountId = useAccountId()
  const { data: account } = useAccount(accountId ?? undefined)
  const modal = useStore<string | null>((s) => s.fundAndWithdrawModal)
  const isFunding = modal === 'fund'

  function onClose() {
    useStore.setState({ fundAndWithdrawModal: null })
  }

  if (!modal) return null
  return (
    <ModalContentWithSummary
      account={account}
      isContentCard
      header={
        <span className='flex items-center gap-4 px-4'>
          <Text>
            {isFunding
              ? `Fund Credit Account ${accountId ?? ''}`
              : `Withdraw from Credit Account ${accountId ?? ''}`}
          </Text>
        </span>
      }
      onClose={onClose}
      content={<FundWithdrawModalContent account={account} isFunding={isFunding} />}
    />
  )
}
