'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from 'components/Button'
import {
  Account,
  Add,
  ArrowDownLine,
  ArrowsLeftRight,
  ArrowUpLine,
  Rubbish,
} from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

export const AccountNavigation = () => {
  const router = useRouter()
  const params = useParams()
  const address = useStore((s) => s.client?.recentWallet.account?.address) || ''
  const selectedAccount = params.account

  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const deleteCreditAccount = useStore((s) => s.deleteCreditAccount)
  const creditAccounts = useStore((s) => s.creditAccounts)

  const hasCreditAccounts = !!creditAccounts?.length
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  const [showMenu, setShowMenu] = useState(false)

  async function createAccountHandler() {
    const accountId = await createCreditAccount({ fee: hardcodedFee })
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

  return (
    <>
      {address ? (
        <>
          {hasCreditAccounts ? (
            <>
              <div className='relative'>
                <Button
                  variant='solid'
                  color='tertiary'
                  className='flex flex-1 flex-nowrap'
                  icon={<Account />}
                  onClick={() => setShowMenu(!showMenu)}
                  hasSubmenu
                >
                  <span>{accountSelected ? `Account ${selectedAccount}` : 'Select Account'}</span>
                </Button>
                <Overlay className='l-0 mt-2 w-[274px]' show={showMenu} setShow={setShowMenu}>
                  {accountSelected && (
                    <div className='flex w-full flex-wrap'>
                      <Text size='sm' uppercase={true} className='w-full justify-center px-4 pt-4'>
                        Manage Account {selectedAccount}
                      </Text>
                      <div className='flex w-full justify-between p-4'>
                        <Button
                          className='flex w-[115px] items-center justify-center pl-0 pr-2'
                          text='Fund'
                          icon={<ArrowUpLine />}
                          onClick={() => {
                            useStore.setState({ fundAccountModal: true })
                            setShowMenu(false)
                          }}
                        />
                        <Button
                          className='flex w-[115px] items-center justify-center pl-0 pr-2'
                          color='secondary'
                          icon={<ArrowDownLine />}
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
                          icon={<Add />}
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
                          icon={<Rubbish />}
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
                          icon={<ArrowsLeftRight />}
                        />
                      </div>
                    </div>
                  )}
                  {creditAccounts.length > 1 && (
                    <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
                      <Text size='sm' uppercase={true} className='w-full justify-center pb-2'>
                        Select Account
                      </Text>
                      {creditAccounts.map((account) =>
                        selectedAccount === account ? null : (
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
                        ),
                      )}
                    </div>
                  )}
                </Overlay>
              </div>
            </>
          ) : (
            <Button onClick={createAccountHandler}>Create Account</Button>
          )}
        </>
      ) : null}
    </>
  )
}
