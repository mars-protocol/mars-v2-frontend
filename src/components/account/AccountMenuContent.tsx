import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { isMobile } from 'react-device-detect'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import AccountList from 'components/account/AccountList'
import AccountMenuTabs from 'components/account/AccountMenuTabs'
import Button from 'components/common/Button'
import { Account, Plus, PlusCircled } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountTitle from 'hooks/accounts/useAccountTitle'
import useAccountVaults from 'hooks/accounts/useAccountVaults'
import useNonHlsAccountIds from 'hooks/accounts/useNonHlsAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import { useLocation } from 'react-router-dom'
import useStore from 'store'
import { checkAccountKind } from 'utils/accounts'

interface Props {
  className?: string
}

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

export default function AccountMenuContent(props: Props) {
  const address = useStore((s) => s.address)
  const accountIds = useNonHlsAccountIds(address)
  const accountId = useAccountId()
  const { data: account } = useAccount(accountId ?? undefined)
  const chainConfig = useChainConfig()
  const managedVaultsEnabled = chainConfig.managedVaults
  const { pathname } = useLocation()
  const [showMenu, setShowMenu] = useToggle()
  const hasCreditAccounts = useMemo(() => !!accountIds?.length, [accountIds])
  const isAccountSelected = useMemo(
    () => hasCreditAccounts && accountId && accountIds && accountIds.includes(accountId),
    [hasCreditAccounts, accountId, accountIds],
  )
  const activeAccountKind = checkAccountKind(account?.kind ?? 'default')
  const accountTitle = useAccountTitle(account, true)
  const { hasVaults } = useAccountVaults(address)

  const performCreateAccount = useCallback(() => {
    setShowMenu(false)
    useStore.setState({
      focusComponent: {
        component: <AccountFundFullPage isCreateAccount />,
        onClose: () => {
          useStore.setState({ getStartedModal: true })
        },
      },
    })
  }, [setShowMenu])

  const handleCreateAccountClick = useCallback(() => {
    setShowMenu(!showMenu)
    if (!hasCreditAccounts && !pathname.includes('/vaults')) {
      useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
      return
    }
  }, [hasCreditAccounts, setShowMenu, showMenu, pathname])

  const accountTabs = [
    {
      title: 'Credit Accounts',
      renderContent: () => <AccountList setShowMenu={setShowMenu} isVaults={false} />,
    },
    {
      title: 'Vault Accounts',
      renderContent: () => <AccountList setShowMenu={setShowMenu} isVaults={true} />,
    },
  ]

  if (!address) return null

  return (
    <div className={classNames('relative', props.className)}>
      <Button
        id={ACCOUNT_MENU_BUTTON_ID}
        onClick={handleCreateAccountClick}
        leftIcon={hasCreditAccounts ? <Account /> : <PlusCircled />}
        color={hasCreditAccounts ? 'secondary' : 'primary'}
        hasFocus={showMenu}
        hasSubmenu={hasCreditAccounts}
        className={isMobile ? 'px-2!' : undefined}
      >
        {hasCreditAccounts
          ? isAccountSelected
            ? accountTitle
            : 'Select Account'
          : 'Create Account'}
      </Button>
      <Overlay
        className='max-w-screen-full right-0 mt-2 flex md:h-[530px] w-[336px] overflow-hidden fixed md:absolute top-18 md:top-8 h-[calc(100dvh-72px)]'
        show={showMenu}
        setShow={setShowMenu}
      >
        <div
          className={classNames(
            'flex h-[54px] w-full items-center justify-between bg-surface px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            {managedVaultsEnabled && hasVaults ? 'Accounts' : 'Credit Accounts'}
          </Text>
          <Button
            color='secondary'
            className='w-[108px]'
            rightIcon={<Plus />}
            iconClassName='h-2.5 w-2.5'
            text='Create'
            onClick={performCreateAccount}
          />
        </div>

        <div
          className={classNames(
            menuClasses,
            'overflow-y-scroll scroll-smooth',
            'top-[54px] h-[calc(100%-54px)] items-start',
            'bg-surface-light',
          )}
        >
          {managedVaultsEnabled && hasVaults ? (
            <AccountMenuTabs
              tabs={accountTabs}
              activeIndex={activeAccountKind === 'default' ? 0 : 1}
            />
          ) : (
            hasCreditAccounts && <AccountList setShowMenu={setShowMenu} isVaults={false} />
          )}
        </div>
      </Overlay>
    </div>
  )
}

export { ACCOUNT_MENU_BUTTON_ID }
