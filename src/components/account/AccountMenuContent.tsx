import classNames from 'classnames'
import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import WalletBridges from 'components/Wallet/WalletBridges'
import AccountCreateFirst from 'components/account/AccountCreateFirst'
import AccountFund from 'components/account/AccountFund/AccountFundFullPage'
import AccountList from 'components/account/AccountList'
import Button from 'components/common/Button'
import { Account, Plus, PlusCircled } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useAccountId from 'hooks/useAccountId'
import useAutoLend from 'hooks/useAutoLend'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import { isNumber } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

interface Props {
  className?: string
}

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

export default function AccountMenuContent(props: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address, true, true)
  const accountId = useAccountId()
  const [searchParams] = useSearchParams()

  const createAccount = useStore((s) => s.createAccount)
  const baseAsset = useBaseAsset()
  const [showMenu, setShowMenu] = useToggle()
  const [isCreating, setIsCreating] = useToggle()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseAsset.denom)
  const [enableAutoLendGlobal] = useEnableAutoLendGlobal()
  const { enableAutoLendAccountId } = useAutoLend()

  const hasCreditAccounts = !!accountIds?.length
  const isAccountSelected =
    hasCreditAccounts && accountId && isNumber(accountId) && accountIds.includes(accountId)

  const checkHasFunds = useCallback(() => {
    return transactionFeeCoinBalance && !BN(transactionFeeCoinBalance.amount).isZero()
  }, [transactionFeeCoinBalance])

  const performCreateAccount = useCallback(async () => {
    setShowMenu(false)
    setIsCreating(true)
    const accountId = await createAccount('default')
    setIsCreating(false)

    if (accountId) {
      navigate(getRoute(getPage(pathname), searchParams, address, accountId))
      if (enableAutoLendGlobal) enableAutoLendAccountId(accountId)
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
    searchParams,
    address,
    enableAutoLendGlobal,
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
