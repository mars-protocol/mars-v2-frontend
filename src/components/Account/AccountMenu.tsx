'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import AccountList from 'components/Account/AccountList'
import CreateAccount from 'components/Account/CreateAccount'
import FundAccount from 'components/Account/FundAccount'
import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Loading from 'components/Loading'
import { Overlay } from 'components/Overlay/Overlay'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import useSWR from 'swr'
import { getAccountsPositions } from 'utils/api'
import { hardcodedFee } from 'utils/contants'

const menuClasses = 'absolute isolate flex w-full flex-wrap overflow-y-scroll scrollbar-hide'

export default function AccountMenu() {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account
  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const address = useStore((s) => s.address)
  const creditAccountsPositions = useStore((s) => s.creditAccountsPositions)
  const hasCreditAccounts = !!creditAccountsPositions?.length
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  const selectedAccountDetails = creditAccountsPositions?.find(
    (position) => position.account === selectedAccount,
  )

  const [showMenu, setShowMenu] = useState(false)

  const [isCreating, setIsCreating] = useState(false)
  const [showFundAccount, setShowFundAccount] = useState(
    !!(selectedAccountDetails && !!!selectedAccountDetails?.deposits?.length),
  )

  const isLoadingAccount =
    selectedAccountDetails && selectedAccountDetails?.account !== selectedAccount
  const showCreateAccount = !hasCreditAccounts || isCreating

  async function createAccountHandler() {
    setShowMenu(true)
    setIsCreating(true)
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    setIsCreating(false)
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  const { data: positions, isLoading } = useSWR(
    `/wallets/${address}/accounts/positions`,
    getAccountsPositions,
  )
  if (positions && !isLoading) useStore.setState({ creditAccountsPositions: positions })

  if (!address) return null

  if (creditAccountsPositions === null) return <Loading className='h-8 w-35' />

  console.log(selectedAccount, showFundAccount, isLoadingAccount)

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
          ? accountSelected
            ? `Account #${selectedAccount}`
            : 'Select Account'
          : 'Create Account'}
      </Button>
      <Overlay
        className='max-w-screen right-0 mt-2 flex h-[530px] w-[336px] overflow-hidden'
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
            <div className={classNames(menuClasses, 'top-[54px] h-[calc(100%-54px)] items-start')}>
              {accountSelected && isLoadingAccount && (
                <div className='flex h-full w-full items-center justify-center p-4'>
                  <CircularProgress size={40} />
                </div>
              )}
              {(!selectedAccount || !showFundAccount) && !isLoadingAccount && (
                <AccountList setShowFundAccount={setShowFundAccount} />
              )}
            </div>
          </>
        ) : (
          <div className={classNames(menuClasses, 'inset-0 h-full items-end bg-account')}>
            {showCreateAccount ? (
              <CreateAccount createAccount={createAccountHandler} isCreating={isCreating} />
            ) : showFundAccount ? (
              <FundAccount setShow={setShowFundAccount} />
            ) : null}
          </div>
        )}
      </Overlay>
    </div>
  )
}
