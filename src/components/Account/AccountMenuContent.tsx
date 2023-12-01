import classNames from 'classnames'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import AccountFund from 'components/Account/AccountFund/AccountFundFullPage'
import AccountList from 'components/Account/AccountList'
import Button from 'components/Button'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccountId from 'hooks/useAccountId'
import useAccountIds from 'hooks/useAccountIds'
import useAutoLend from 'hooks/useAutoLend'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useLocalStorage from 'hooks/useLocalStorage'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import { isNumber } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

export default function AccountMenuContent() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address, true, true)
  const accountId = useAccountId()

  const createAccount = useStore((s) => s.createAccount)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const [showMenu, setShowMenu] = useToggle()
  const [isCreating, setIsCreating] = useToggle()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseCurrency.denom)
  const [lendAssets] = useLocalStorage<boolean>(
    LocalStorageKeys.LEND_ASSETS,
    DEFAULT_SETTINGS.lendAssets,
  )
  const { enableAutoLendAccountId } = useAutoLend()

  const hasCreditAccounts = !!accountIds?.length
  const isAccountSelected =
    hasCreditAccounts && accountId && isNumber(accountId) && accountIds.includes(accountId)

  const checkHasFunds = useCallback(() => {
    return (
      transactionFeeCoinBalance &&
      BN(transactionFeeCoinBalance.amount).isGreaterThan(defaultFee.amount[0].amount)
    )
  }, [transactionFeeCoinBalance])

  const performCreateAccount = useCallback(async () => {
    setShowMenu(false)
    setIsCreating(true)
    const accountId = await createAccount('default')
    setIsCreating(false)

    if (accountId) {
      navigate(getRoute(getPage(pathname), address, accountId))
      if (lendAssets) enableAutoLendAccountId(accountId)
      useStore.setState({
        focusComponent: {
          component: <AccountFund />,
          onClose: () => {
            useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [
    setShowMenu,
    setIsCreating,
    createAccount,
    navigate,
    pathname,
    address,
    lendAssets,
    enableAutoLendAccountId,
  ])

  const handleCreateAccountClick = useCallback(() => {
    setShowMenu(!showMenu)
    if (!checkHasFunds() && !hasCreditAccounts) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }
    if (!hasCreditAccounts) {
      useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
      return
    }
  }, [checkHasFunds, hasCreditAccounts, setShowMenu, showMenu])

  if (!address) return null

  return (
    <div className='relative'>
      <Button
        id={ACCOUNT_MENU_BUTTON_ID}
        onClick={handleCreateAccountClick}
        leftIcon={hasCreditAccounts ? <Account /> : <PlusCircled />}
        color={hasCreditAccounts ? 'tertiary' : 'primary'}
        hasFocus={showMenu}
        hasSubmenu={hasCreditAccounts}
      >
        {hasCreditAccounts
          ? isAccountSelected
            ? `Credit Account ${accountId}`
            : 'Select Account'
          : 'Create Account'}
      </Button>
      <Overlay
        className='max-w-screen right-0 mt-2 flex h-[530px] w-[336px] overflow-hidden'
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
            showProgressIndicator={isCreating}
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
