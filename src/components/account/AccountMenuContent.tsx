import classNames from 'classnames'
import { useCallback } from 'react'
import { isMobile } from 'react-device-detect'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import AccountList from 'components/account/AccountList'
import Button from 'components/common/Button'
import { Account, Plus, PlusCircled } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useToggle from 'hooks/common/useToggle'
import useHasFundsForTxFee from 'hooks/wallet/useHasFundsForTxFee'
import useStore from 'store'
import AccountCreateSelect from './AccountCreateSelect'

interface Props {
  className?: string
}

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

export default function AccountMenuContent(props: Props) {
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address, true, true)
  const accountId = useAccountId()
  const [showMenu, setShowMenu] = useToggle()
  const hasFundsForTxFee = useHasFundsForTxFee()

  const hasCreditAccounts = !!accountIds?.length
  const isAccountSelected = hasCreditAccounts && accountId && accountIds.includes(accountId)

  const performCreateAccount = useCallback(() => {
    setShowMenu(false)
    useStore.setState({
      focusComponent: {
        component: <AccountCreateSelect />,
        onClose: () => {
          // TODO: update docs to reflect the current state of v2
          //useStore.setState({ getStartedModal: true })
        },
      },
    })
  }, [setShowMenu])

  const handleCreateAccountClick = useCallback(() => {
    setShowMenu(!showMenu)
    if (!hasFundsForTxFee && !hasCreditAccounts) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }
    if (!hasCreditAccounts) {
      useStore.setState({ focusComponent: { component: <AccountCreateSelect /> } })
      return
    }
  }, [hasFundsForTxFee, hasCreditAccounts, setShowMenu, showMenu])

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
        className={isMobile ? '!px-2' : undefined}
      >
        {hasCreditAccounts
          ? isAccountSelected
            ? `Credit Account ${accountId}`
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
            'flex h-[54px] w-full items-center justify-between bg-white/5 px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            Credit Accounts
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
          )}
        >
          {hasCreditAccounts && <AccountList setShowMenu={setShowMenu} />}
        </div>
      </Overlay>
    </div>
  )
}

export { ACCOUNT_MENU_BUTTON_ID }
