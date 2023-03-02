'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from 'components/Button'
import { Account, Add, ArrowDown, ArrowsLeftRight, ArrowUp, Rubbish } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import { OverlayAction } from 'components/Overlay/OverlayAction'
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
                          onClick={() => {
                            useStore.setState({ fundAccountModal: true })
                            setShowMenu(false)
                          }}
                        >
                          <span className='mr-1 w-3'>
                            <ArrowUp />
                          </span>
                          Fund
                        </Button>
                        <Button
                          className='flex w-[115px] items-center justify-center pl-0 pr-2'
                          color='secondary'
                          onClick={() => {
                            useStore.setState({ withdrawModal: true })
                            setShowMenu(false)
                          }}
                        >
                          <span className='mr-1 w-3'>
                            <ArrowDown />
                          </span>
                          Withdraw
                        </Button>
                      </div>
                      <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
                        <OverlayAction
                          setShow={setShowMenu}
                          text='Create New Account'
                          onClick={createAccountHandler}
                          icon={<Add />}
                        />
                        <OverlayAction
                          setShow={setShowMenu}
                          text='Close Account'
                          onClick={deleteAccountHandler}
                          icon={<Rubbish />}
                        />
                        <OverlayAction
                          setShow={setShowMenu}
                          text='Transfer Balance'
                          onClick={() => alert('TODO')}
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
                            variant='text'
                            className='w-full cursor-pointer whitespace-nowrap py-2 text-sm text-white/80 hover:text-white'
                            onClick={() => {
                              router.push(`/wallets/${params.wallet}/accounts/${account}`)
                              setShowMenu(!showMenu)
                            }}
                          >
                            {`Account ${account}`}
                          </Button>
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
