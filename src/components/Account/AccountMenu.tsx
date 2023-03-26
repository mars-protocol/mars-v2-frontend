'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from 'components/Button'
import {
  Account,
  Add,
  ArrowDownLine,
  ArrowRight,
  ArrowsLeftRight,
  ArrowUpLine,
  Rubbish,
} from 'components/Icons'
import Loading from 'components/Loading'
import { Overlay } from 'components/Overlay/Overlay'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

export default function AccountMenu() {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account

  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const deleteCreditAccount = useStore((s) => s.deleteCreditAccount)
  const creditAccounts = useStore((s) => s.creditAccounts)
  const address = useStore((s) => s.address)

  const hasCreditAccounts = !!creditAccounts?.length
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  const [showMenu, setShowMenu] = useState(false)

  const [createAccount, setCreateAccount] = useState(false)

  async function createAccountHandler() {
    setShowMenu(true)
    setCreateAccount(true)
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    setCreateAccount(false)
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  async function deleteAccountHandler() {
    if (!accountSelected) return
    const isSuccess = await deleteCreditAccount({ fee: hardcodedFee, accountId: selectedAccount })
    if (isSuccess) {
      router.push(`/wallets/${params.wallet}/accounts`)
    }
  }

  return !address ? null : (
    <>
      {creditAccounts === null ? (
        <Loading className='h-8 w-35' />
      ) : (
        <div className='relative'>
          <Button
            onClick={hasCreditAccounts ? () => setShowMenu(!showMenu) : createAccountHandler}
            leftIcon={hasCreditAccounts ? <Account /> : <Add />}
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
            className={classNames(
              'max-w-screen right-0 mt-2 flex h-[530px] w-[336px] flex-wrap overflow-y-scroll scrollbar-hide',
              hasCreditAccounts ? 'items-start' : 'items-end',
            )}
            show={showMenu}
            setShow={setShowMenu}
          >
            <div className='absolute inset-0 z-1 h-full w-full bg-account' />
            {(!hasCreditAccounts || createAccount) && (
              <div className='relative z-10 w-full p-4'>
                <Text size='lg' className='mb-2 font-bold'>
                  Create your first Credit Account
                </Text>
                <Text className='mb-4 text-white/70'>
                  Please approve the transaction in your wallet in order to create your first Credit
                  Account.
                </Text>
                <Button
                  className='w-full'
                  showProgressIndicator={createAccount}
                  disabled={createAccount}
                  text='Create Account'
                  rightIcon={<ArrowRight />}
                  onClick={createAccountHandler}
                />
              </div>
            )}
            {accountSelected && (
              <div className='flex w-full flex-wrap'>
                <Text size='sm' uppercase={true} className='w-full px-4 pt-4'>
                  Manage Account {selectedAccount}
                </Text>
                <div className='flex w-full justify-between p-4'>
                  <Button
                    className='flex w-[115px] items-center justify-center pl-0 pr-2'
                    text='Fund'
                    leftIcon={<ArrowUpLine />}
                    onClick={() => {
                      useStore.setState({ fundAccountModal: true })
                      setShowMenu(false)
                    }}
                  />
                  <Button
                    className='flex w-[115px] items-center justify-center pl-0 pr-2'
                    color='secondary'
                    leftIcon={<ArrowDownLine />}
                    text='Withdraw'
                    onClick={() => {
                      useStore.setState({ withdrawModal: true })
                      setShowMenu(false)
                    }}
                  />
                </div>
                <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
                  <Button
                    className='w-full whitespace-nowrap py-2'
                    variant='transparent'
                    color='quaternary'
                    text='Create New Account'
                    onClick={() => {
                      setShowMenu(false)
                      createAccountHandler()
                    }}
                    leftIcon={<Add />}
                  />
                  <Button
                    className='w-full whitespace-nowrap py-2'
                    variant='transparent'
                    color='quaternary'
                    text='Close Account'
                    onClick={() => {
                      setShowMenu(false)
                      deleteAccountHandler()
                    }}
                    leftIcon={<Rubbish />}
                  />
                  <Button
                    className='w-full whitespace-nowrap py-2'
                    variant='transparent'
                    color='quaternary'
                    text='Transfer Balance'
                    onClick={() => {
                      setShowMenu(false)
                      /* TODO: add Transfer Balance Function */
                    }}
                    leftIcon={<ArrowsLeftRight />}
                  />
                </div>
              </div>
            )}
            {creditAccounts.length > 1 && (
              <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
                <Text size='sm' uppercase={true} className='w-full pb-2'>
                  Select Account
                </Text>
                {creditAccounts.map((account) => {
                  return selectedAccount === account ? null : (
                    <Button
                      key={account}
                      className='w-full whitespace-nowrap py-2'
                      variant='transparent'
                      color='quaternary'
                      onClick={() => {
                        router.push(`/wallets/${params.wallet}/accounts/${account}`)
                        setShowMenu(!showMenu)
                      }}
                      text={`Account ${account}`}
                    />
                  )
                })}
              </div>
            )}
          </Overlay>
        </div>
      )}
    </>
  )
}
