import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import Accordion from 'components/common/Accordion'
import AccountCard from 'components/account/AccountList/AccountCard'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'

interface Props {
  setShowMenu: (show: boolean) => void
}

export default function AccountList(props: Props) {
  const { setShowMenu } = props
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const currentAccountId = useAccountId()
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address, true, true)
  const [searchParams] = useSearchParams()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  useEffect(() => {
    if (!currentAccountId) return
    const element = document.getElementById(`account-${currentAccountId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentAccountId])

  const isActive = (accountId: string) => currentAccountId === accountId

  const handleToggle = useCallback(() => {
    setIsAdvancedOpen(!isAdvancedOpen)
  }, [isAdvancedOpen])

  if (!accountIds || !accountIds.length) return null

  return (
    <div className='flex flex-col h-full'>
      {/* Regular accounts */}
      <div className='flex-1 overflow-auto scrollbar-hide'>
        <div className='flex flex-wrap w-full p-4'>
          {accountIds.map((accountId) => (
            <AccountCard
              key={accountId}
              accountId={accountId}
              isActive={isActive(accountId)}
              setShowMenu={setShowMenu}
              pathname={pathname}
              chainConfig={chainConfig}
              searchParams={searchParams}
              address={address}
              showUSDCMarginOnly={false}
            />
          ))}
        </div>
      </div>

      {/* Advanced Accounts Accordion */}
      <Accordion
        allowMultipleOpen
        items={[
          {
            title: 'Advanced Accounts',
            renderContent: () => (
              <div className='flex flex-wrap w-full'>
                {accountIds.map((accountId) => (
                  <AccountCard
                    key={accountId}
                    accountId={accountId}
                    isActive={isActive(accountId)}
                    setShowMenu={setShowMenu}
                    pathname={pathname}
                    chainConfig={chainConfig}
                    searchParams={searchParams}
                    address={address}
                    showUSDCMarginOnly={true}
                  />
                ))}
              </div>
            ),
            renderSubTitle: () => null,
            isOpen: isAdvancedOpen,
            toggleOpen: handleToggle,
          },
        ]}
      />
    </div>
  )
}
