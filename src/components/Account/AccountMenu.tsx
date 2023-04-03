'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AccountList from 'components/Account/AccountList'
import FundAccount from 'components/Account/FundAccount'
import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, Plus, PlusCircled } from 'components/Icons'
import Loading from 'components/Loading'
import { Overlay } from 'components/Overlay/Overlay'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { getAccountDebts, getAccountDeposits } from 'utils/api'
import { hardcodedFee } from 'utils/contants'

import CreateAccount from './CreateAccount'

const menuClasses = 'absolute isolate flex w-full flex-wrap overflow-y-scroll scrollbar-hide'

export default function AccountMenu() {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account

  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const selectedAccountDetails = useStore((s) => s.selectedAccountDetails)
  const creditAccounts = useStore((s) => s.creditAccounts)
  const address = useStore((s) => s.address)

  const hasCreditAccounts = !!creditAccounts?.length
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  const [showMenu, setShowMenu] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showFundAccount, setShowFundAccount] = useState(false)

  async function createAccountHandler() {
    setShowMenu(true)
    setCreateAccount(true)
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    setCreateAccount(false)
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  useEffect(() => {
    if (!accountSelected) return
    setLoadingAccount(selectedAccountDetails?.account !== selectedAccount)
  }, [selectedAccount, selectedAccountDetails?.account, accountSelected])

  useEffect(() => {
    if (!accountSelected) return

    const fetchAccountDetails = async () => {
      const accountDeposits = await getAccountDeposits(selectedAccount)
      const accountDebts = await getAccountDebts(selectedAccount)
      useStore.setState({
        selectedAccountDetails: {
          account: selectedAccount,
          deposits: accountDeposits,
          debts: accountDebts,
          lends: [],
        },
      })
    }

    fetchAccountDetails()
  }, [creditAccounts, selectedAccount, accountSelected])

  useEffect(() => {
    setShowCreateAccount(!hasCreditAccounts || createAccount)
  }, [hasCreditAccounts, createAccount])

  useEffect(() => {
    if (!selectedAccountDetails?.deposits) return
    setShowFundAccount(!!!selectedAccountDetails?.deposits?.length)
  }, [selectedAccountDetails?.deposits])

  return !address ? null : (
    <>
      {creditAccounts === null ? (
        <Loading className='h-8 w-35' />
      ) : (
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
                <div
                  className={classNames(menuClasses, 'top-[54px] h-[calc(100%-54px)] items-start')}
                >
                  {accountSelected && loadingAccount && (
                    <div className='flex h-full w-full items-center justify-center p-4'>
                      <CircularProgress size={40} />
                    </div>
                  )}
                  {(!selectedAccount || !showFundAccount) && !loadingAccount && (
                    <AccountList setShowFundAccount={setShowFundAccount} />
                  )}
                </div>
              </>
            ) : (
              <div className={classNames(menuClasses, 'inset-0 h-full items-end bg-account')}>
                {showCreateAccount ? (
                  <CreateAccount
                    createAccountHandler={createAccountHandler}
                    createAccount={createAccount}
                    setCreateAccount={setCreateAccount}
                  />
                ) : showFundAccount ? (
                  <FundAccount setShowFundAccount={setShowFundAccount} />
                ) : null}
              </div>
            )}
          </Overlay>
        </div>
      )}
    </>
  )
}
