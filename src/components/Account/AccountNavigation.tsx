'use client'

import classNames from 'classnames'
import { useMemo, useState } from 'react'

import { ChevronDown } from 'components/Icons'
import { Button } from 'components/Button'
import { Overlay } from 'components/Overlay/Overlay'
import { useAccountDetailsStore } from 'stores/useAccountDetailsStore'

import { AccountManageOverlay } from './AccountManageOverlay'

interface Props {
  creditAccountsList: string[]
  selectedAccount: string | null
}

const MAX_VISIBLE_CREDIT_ACCOUNTS = 5

export const AccountNavigation = ({ creditAccountsList, selectedAccount }: Props) => {
  const { firstCreditAccounts, restCreditAccounts } = useMemo(() => {
    return {
      firstCreditAccounts: creditAccountsList?.slice(0, MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
      restCreditAccounts: creditAccountsList?.slice(MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
    }
  }, [creditAccountsList])

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  return (
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
            useAccountDetailsStore.setState({ selectedAccount: account, isOpen: true })
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
                      useAccountDetailsStore.setState({ selectedAccount: account, isOpen: true })
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
  )
}
