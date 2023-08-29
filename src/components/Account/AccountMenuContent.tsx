import classNames from 'classnames'
import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import AccountFund from 'components/Account/AccountFund'
import AccountList from 'components/Account/AccountList'
import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import { isNumber } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'
const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

interface Props {
  accounts: Account[]
}

export default function AccountMenuContent(props: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { accountId, address } = useParams()
  const createAccount = useStore((s) => s.createAccount)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const [showMenu, setShowMenu] = useToggle()
  const [isCreating, setIsCreating] = useToggle()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseCurrency.denom)

  const hasCreditAccounts = !!props.accounts.length
  const isAccountSelected = isNumber(accountId)

  const selectedAccountDetails = props.accounts.find((account) => account.id === accountId)

  const isLoadingAccount = isAccountSelected && selectedAccountDetails?.id !== accountId

  const checkHasFunds = useCallback(() => {
    return (
      transactionFeeCoinBalance &&
      BN(transactionFeeCoinBalance.amount).isGreaterThan(defaultFee.amount[0].amount)
    )
  }, [transactionFeeCoinBalance])

  const performCreateAccount = useCallback(async () => {
    setShowMenu(true)
    setIsCreating(true)
    const accountId = await createAccount()
    setIsCreating(false)

    if (accountId) {
      navigate(getRoute(getPage(pathname), address, accountId))
      useStore.setState({
        focusComponent: {
          component: <AccountFund />,
          onClose: () => {
            useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [createAccount, navigate, pathname, address, setShowMenu, setIsCreating])

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

  useEffect(() => {
    useStore.setState({ accounts: props.accounts })
  }, [props.accounts])

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
          {isAccountSelected && isLoadingAccount && (
            <div className='flex items-center justify-center w-full h-full p-4'>
              <CircularProgress size={40} />
            </div>
          )}
          {hasCreditAccounts && !isLoadingAccount && (
            <AccountList accounts={props.accounts} setShowMenu={setShowMenu} />
          )}
        </div>
      </Overlay>
    </div>
  )
}

export { ACCOUNT_MENU_BUTTON_ID }
