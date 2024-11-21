import { useEffect, useState } from 'react'

import AccountFundContent from 'components/account/AccountFund/AccountFundContent'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'
import useChainConfig from 'hooks/chain/useChainConfig'
import { ChainInfoID } from 'types/enums'
import { isAccountEmpty } from 'utils/accounts'
import Text from 'components/common/Text'

export default function AccountFundFullPage() {
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const chainConfig = useChainConfig()

  const { data: accounts, isLoading } = useAccounts('default', address)
  const currentAccount = useCurrentAccount()
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)

  const isPionTestnet = chainConfig.id === ChainInfoID.Pion1

  useEffect(() => {
    if (accounts && !selectedAccountId && accountId) setSelectedAccountId(accountId)
    if (accountId && selectedAccountId !== accountId) setSelectedAccountId(accountId)
  }, [accounts, selectedAccountId, accountId, currentAccount])

  if (!selectedAccountId || !address) return null

  // Remove this once the competition is over
  if (isPionTestnet && currentAccount && isAccountEmpty(currentAccount)) {
    return (
      <FullOverlayContent
        title='You’re in!'
        copy='Your account is ready for the trading competition.'
      >
        <div className='text-center'>
          <Text className='text-[#FF9900] font-medium'>Come back on November 25th at 4pm UTC</Text>
        </div>
      </FullOverlayContent>
    )
  }

  return (
    <FullOverlayContent
      title={`Fund Credit Account #${selectedAccountId}`}
      copy='In order to start using this account, you need to deposit funds.'
      docs='fund'
    >
      {isLoading ? (
        <CircularProgress size={40} />
      ) : (
        <Card className='w-full p-6 bg-white/5'>
          <AccountFundContent
            account={currentAccount}
            address={address}
            accountId={selectedAccountId}
            isFullPage
          />
        </Card>
      )}
    </FullOverlayContent>
  )
}
