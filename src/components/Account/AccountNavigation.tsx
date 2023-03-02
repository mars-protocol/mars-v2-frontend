'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from 'components/Button'
import { Account } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

export const AccountNavigation = () => {
  const router = useRouter()
  const params = useParams()
  const address = useStore((s) => s.client?.recentWallet.account?.address) || ''
  const selectedAccount = params.account
  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const creditAccounts = useStore((s) => s.creditAccounts)

  const hasCreditAccounts = !!creditAccounts?.length

  const [showMoreMenu, setShowMoreMenu] = useState(false)

  async function createAccountHandler() {
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  return (
    <>
      {hasCreditAccounts ? (
        <>
          <div className='relative'>
            <Button
              variant='solid'
              color='tertiary'
              className='flex flex-1 flex-nowrap'
              icon={<Account />}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              hasSubmenu
            >
              <span>{`Account ${selectedAccount}`}</span>{' '}
            </Button>
            <Overlay className='r-0 mt-2' show={showMoreMenu} setShow={setShowMoreMenu}>
              <div className='flex w-full flex-wrap p-4'>
                {creditAccounts.map((account) => (
                  <Button
                    key={account}
                    variant='text'
                    className={classNames(
                      'w-full whitespace-nowrap py-2 text-sm',
                      selectedAccount === account
                        ? 'text-white'
                        : 'cursor-pointer text-white/60 hover:text-white/80',
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
          </div>
        </>
      ) : (
        <>{address ? <Button onClick={createAccountHandler}>Create Account</Button> : ''}</>
      )}
    </>
  )
}
