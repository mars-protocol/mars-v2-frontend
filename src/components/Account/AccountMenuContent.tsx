import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import AccountList from 'components/Account/AccountList'
import CreateAccount from 'components/Account/CreateAccount'
import FundAccount from 'components/Account/FundAccount'
import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import { isNumber } from 'utils/parsers'

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'
const ACCOUNT_MENU_BUTTON_ID = 'account-menu-button'

interface Props {
  accounts: Account[]
}

export default function AccountMenuContent(props: Props) {
  const navigate = useNavigate()
  const { accountId, address } = useParams()
  const createAccount = useStore((s) => s.createAccount)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const [showMenu, setShowMenu] = useToggle()
  const [isCreating, setIsCreating] = useToggle()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseCurrency.denom)

  const hasCreditAccounts = !!props.accounts.length
  const isAccountSelected = isNumber(accountId)

  const selectedAccountDetails = props.accounts.find((account) => account.id === accountId)
  const [showFundAccount, setShowFundAccount] = useState<boolean>(
    isAccountSelected && !selectedAccountDetails?.deposits?.length,
  )

  const isLoadingAccount = isAccountSelected && selectedAccountDetails?.id !== accountId
  const showCreateAccount = !hasCreditAccounts || isCreating

  const checkHasFunds = useCallback(() => {
    return (
      transactionFeeCoinBalance &&
      BN(transactionFeeCoinBalance.amount).isGreaterThan(hardcodedFee.amount[0].amount)
    )
  }, [transactionFeeCoinBalance])

  const performCreateAccount = useCallback(async () => {
    setShowMenu(true)
    setIsCreating(true)
    const accountId = await createAccount({ fee: hardcodedFee })
    setIsCreating(false)

    accountId && navigate(`/wallets/${address}/accounts/${accountId}`)
  }, [address, createAccount, navigate, setIsCreating, setShowMenu])

  const handleCreateAccountClick = useCallback(() => {
    if (!checkHasFunds()) {
      useStore.setState({ focusComponent: <WalletBridges /> })
      return
    }
    if (!hasCreditAccounts) {
      useStore.setState({ focusComponent: <AccountCreateFirst /> })
      return
    }

    setShowMenu(!showMenu)
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
            ? `Account ${accountId}`
            : 'Select Account'
          : 'Create Account'}
      </Button>
      <Overlay
        className={classNames(
          'max-w-screen right-0 mt-2 flex h-[530px] w-[336px]',
          !showFundAccount && 'overflow-hidden',
        )}
        show={showMenu}
        setShow={setShowMenu}
      >
        {!showFundAccount && !showCreateAccount ? (
          <>
            <div
              className={classNames(
                'flex h-[54px] w-full items-center justify-between bg-white/5 px-4 py-3',
                'border border-transparent border-b-white/10',
              )}
            >
              <Text size='lg' className='font-bold'>
                Accounts
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
                !showFundAccount && 'overflow-y-scroll scroll-smooth',
                'top-[54px] h-[calc(100%-54px)] items-start',
              )}
            >
              {isAccountSelected && isLoadingAccount && (
                <div className='flex h-full w-full items-center justify-center p-4'>
                  <CircularProgress size={40} />
                </div>
              )}
              {hasCreditAccounts && !showFundAccount && !isLoadingAccount && (
                <AccountList accounts={props.accounts} setShowFundAccount={setShowFundAccount} />
              )}
            </div>
          </>
        ) : (
          <div
            className={classNames(
              menuClasses,
              !showFundAccount && 'overflow-y-scroll scroll-smooth',
              'inset-0 h-full items-end bg-account',
            )}
          >
            {showCreateAccount ? (
              <CreateAccount createAccount={performCreateAccount} isCreating={isCreating} />
            ) : showFundAccount ? (
              <FundAccount setShowFundAccount={setShowFundAccount} setShowMenu={setShowMenu} />
            ) : null}
          </div>
        )}
      </Overlay>
    </div>
  )
}

export { ACCOUNT_MENU_BUTTON_ID }
