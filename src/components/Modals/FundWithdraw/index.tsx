import Text from 'components/common/Text'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import ModalContentWithSummary from 'ModalContentWithSummary'
import useStore from 'store'
import FundWithdrawModalContent from './FundAndWithdrawModalContent'

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
        <span className='flex items-center gap-4 px-2 md:px-4'>
          <Text>
            {isFunding
              ? `Fund Credit Account ${accountId ?? ''}`
              : `Withdraw from Credit Account ${accountId ?? ''}`}
          </Text>
        </span>
      }
      headerClassName='pl-2 pr-2.5 py-3'
      onClose={onClose}
      content={<FundWithdrawModalContent account={account} isFunding={isFunding} />}
    />
  )
}
