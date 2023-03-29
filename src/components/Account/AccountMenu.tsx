'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AccountList from 'components/Account/AccountList'
import CurrentAccount from 'components/Account/CurrentAccount'
import FundAccount from 'components/Account/FundAccount'
import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Account, PlusCircled } from 'components/Icons'
import Loading from 'components/Loading'
import { Overlay } from 'components/Overlay/Overlay'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { getAccountDebts, getAccountDeposits } from 'utils/api'
import { hardcodedFee } from 'utils/contants'

import CreateAccount from './CreateAccount'

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
  const hasBalance = !!selectedAccountDetails?.deposits?.length

  const [showMenu, setShowMenu] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
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
    setLoadingAccount(selectedAccountDetails?.id !== selectedAccount)
  }, [selectedAccount, selectedAccountDetails?.id, accountSelected])

  useEffect(() => {
    if (!accountSelected) return

    const fetchAccountDetails = async () => {
      const accountDeposits = await getAccountDeposits(selectedAccount)
      const accountDebts = await getAccountDebts(selectedAccount)
      useStore.setState({
        selectedAccountDetails: {
          id: selectedAccount,
          deposits: accountDeposits,
          debts: accountDebts,
        },
      })
    }

    fetchAccountDetails()
  }, [creditAccounts, selectedAccount, accountSelected])

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
            <div
              className={classNames(
                'absolute inset-0 z-1 flex h-full w-full flex-wrap  overflow-y-scroll bg-account scrollbar-hide',
                hasCreditAccounts && hasBalance && !showFundAccount ? 'items-start' : 'items-end',
              )}
            >
              {(!hasCreditAccounts || createAccount) && (
                <CreateAccount
                  createAccountHandler={createAccountHandler}
                  createAccount={createAccount}
                  setCreateAccount={setCreateAccount}
                />
              )}
              {accountSelected && (
                <div className='flex w-full flex-wrap'>
                  {loadingAccount ? (
                    <div className='flex h-[530px] w-full items-center justify-center p-4'>
                      <CircularProgress size={40} />
                    </div>
                  ) : (
                    <>
                      {showFundAccount ? (
                        <FundAccount setShowFundAccount={setShowFundAccount} />
                      ) : (
                        <CurrentAccount setShowFundAccount={setShowFundAccount} />
                      )}
                    </>
                  )}
                </div>
              )}
              {(!selectedAccount || !showFundAccount) &&
                !!creditAccounts.length &&
                !loadingAccount && <AccountList />}
            </div>
          </Overlay>
        </div>
      )}
    </>
  )
}
