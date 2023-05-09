'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AccountList from 'components/Account/AccountList'
import CreateAccount from 'components/Account/CreateAccount'
import FundAccount from 'components/Account/FundAccount'
import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'
import { isNumber } from 'utils/parsers'
import useParams from 'utils/route'

const menuClasses = 'absolute isolate flex w-full flex-wrap scrollbar-hide'

interface Props {
  accounts: Account[]
}

export default function AccountMenuContent(props: Props) {
  const router = useRouter()
  const params = useParams()
  const createAccount = useStore((s) => s.createAccount)
  const [showMenu, setShowMenu] = useToggle()
  const [isCreating, setIsCreating] = useToggle()

  const selectedAccountId = params.accountId
  const hasCreditAccounts = !!props.accounts.length
  const isAccountSelected = isNumber(selectedAccountId)

  const selectedAccountDetails = props.accounts.find((account) => account.id === selectedAccountId)
  const [showFundAccount, setShowFundAccount] = useState<boolean>(
    isAccountSelected && !selectedAccountDetails?.deposits?.length,
  )

  const isLoadingAccount = isAccountSelected && selectedAccountDetails?.id !== selectedAccountId
  const showCreateAccount = !hasCreditAccounts || isCreating

  async function createAccountHandler() {
    setShowMenu(true)
    setIsCreating(true)
    const accountId = await createAccount({ fee: hardcodedFee })
    setIsCreating(false)
    if (!accountId) return
    router.push(`/wallets/${params.address}/accounts/${accountId}`)
  }

  useEffect(() => {
    useStore.setState({ accounts: props.accounts })
  }, [props.accounts])

  if (!params.address) return null

  return (
    <div className='relative'>
      <Button
        onClick={hasCreditAccounts ? () => setShowMenu(!showMenu) : createAccountHandler}
        leftIcon={hasCreditAccounts ? <Account /> : <PlusCircled />}
        color={hasCreditAccounts ? 'tertiary' : 'primary'}
        hasFocus={showMenu}
        hasSubmenu={hasCreditAccounts}
      >
        {hasCreditAccounts
          ? isAccountSelected
            ? `Account ${selectedAccountId}`
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
                onClick={createAccountHandler}
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
              <CreateAccount createAccount={createAccountHandler} isCreating={isCreating} />
            ) : showFundAccount ? (
              <FundAccount setShowFundAccount={setShowFundAccount} setShowMenu={setShowMenu} />
            ) : null}
          </div>
        )}
      </Overlay>
    </div>
  )
}
