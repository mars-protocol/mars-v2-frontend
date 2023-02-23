'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'

import { AccountManageOverlay } from 'components/Account/AccountManageOverlay'
import { Button } from 'components/Button'
import { ChevronDown } from 'components/Icons'
import Loading from 'components/Loading'
import { Overlay } from 'components/Overlay/Overlay'
import useParams from 'hooks/useParams'
import getCreditAccounts from 'libs/getCreditAccounts'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

const MAX_VISIBLE_CREDIT_ACCOUNTS = 5

export const AccountNavigation = () => {
  const router = useRouter()
  const params = useParams()
  const address = useStore((s) => s.client?.recentWallet.account?.address) || ''
  const selectedAccount = params.account
  const createCreditAccount = useStore((s) => s.createCreditAccount)

  const { data: creditAccounts, isLoading } = useSWR(
    address ? queryKeys.creditAccounts(address) : null,
    () => getCreditAccounts(address),
  )
  const hasCreditAccounts = !isLoading && creditAccounts?.length
  const firstCreditAccounts = creditAccounts?.slice(0, MAX_VISIBLE_CREDIT_ACCOUNTS) ?? []
  const restCreditAccounts = creditAccounts?.slice(MAX_VISIBLE_CREDIT_ACCOUNTS) ?? []

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  async function createAccountHandler() {
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  return (
    <section
      role='navigation'
      className='flex h-11 w-full items-center gap-6 border-b border-white/20 px-6 text-sm text-white/40'
    >
      {isLoading ? (
        <Loading className='h-4 w-30' count={3} />
      ) : (
        <>
          {hasCreditAccounts ? (
            <>
              {firstCreditAccounts.map((account) => (
                <Button
                  key={account}
                  className={classNames(
                    'cursor-pointer whitespace-nowrap px-4 text-base hover:text-white',
                    selectedAccount === account ? 'text-white' : 'text-white/40',
                  )}
                  variant='text'
                  onClick={() => {
                    router.push(`/wallets/${params.wallet}/accounts/${account}/${params.page}`)
                  }}
                >
                  Account {account}
                </Button>
              ))}
              <div className='relative'>
                {restCreditAccounts.length > 0 && (
                  <>
                    <Button
                      className='flex items-center px-3 py-3 text-base hover:text-white'
                      variant='text'
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                      More
                      <span className='ml-1 inline-block w-3'>
                        <ChevronDown />
                      </span>
                    </Button>
                    <Overlay show={showMoreMenu} setShow={setShowMoreMenu}>
                      <div className='flex w-[120px] flex-wrap p-4'>
                        {restCreditAccounts.map((account) => (
                          <Button
                            key={account}
                            variant='text'
                            className={classNames(
                              'w-full whitespace-nowrap py-2 text-sm',
                              selectedAccount === account
                                ? 'text-secondary'
                                : 'cursor-pointer text-accent-dark hover:text-secondary',
                            )}
                            onClick={() => {
                              setShowMoreMenu(!showMoreMenu)
                              router.push(`/wallets/${params.wallet}/accounts/${account}`)
                            }}
                          >
                            Account {account}
                          </Button>
                        ))}
                      </div>
                    </Overlay>
                  </>
                )}
              </div>
              <div className='relative'>
                <Button
                  className={classNames(
                    'flex items-center px-3 py-3 text-base hover:text-white',
                    showManageMenu ? 'text-white' : 'text-white/40',
                  )}
                  onClick={() => setShowManageMenu(!showManageMenu)}
                  variant='text'
                >
                  Manage
                  <span className='ml-1 inline-block w-3'>
                    <ChevronDown />
                  </span>
                </Button>

                <AccountManageOverlay
                  className='-left-[86px]'
                  show={showManageMenu}
                  setShow={setShowManageMenu}
                />
              </div>
            </>
          ) : (
            <>{address ? <Button onClick={createAccountHandler}>Create Account</Button> : ''}</>
          )}
        </>
      )}
    </section>
  )
}
