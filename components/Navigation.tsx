import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Popover } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

import SearchInput from 'components/SearchInput'
import ProgressBar from 'components/ProgressBar'
import Spinner from 'components/Spinner'
import Wallet from 'components/Wallet'
import { formatCurrency } from 'utils/formatters'
import useCreditAccounts from 'hooks/useCreditAccounts'
import useCreateCreditAccount from 'hooks/useCreateCreditAccount'
import useDeleteCreditAccount from 'hooks/useDeleteCreditAccount'
import useCreditManagerStore from 'stores/useCreditManagerStore'

// TODO: will require some tweaks depending on how lower viewport mocks pans out
const MAX_VISIBLE_CREDIT_ACCOUNTS = 5

const navItems = [
  { href: '/trade', label: 'Trade' },
  { href: '/yield', label: 'Yield' },
  { href: '/borrow', label: 'Borrow' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/council', label: 'Council' },
]

const NavLink = ({ href, children }: { href: string; children: string }) => {
  const router = useRouter()

  return (
    <Link href={href} passHref>
      <a className={`${router.pathname === href ? 'text-white' : ''} hover:text-white`}>
        {children}
      </a>
    </Link>
  )
}

const Navigation = () => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const setSelectedAccount = useCreditManagerStore((s) => s.actions.setSelectedAccount)
  const toggleCreditManager = useCreditManagerStore((s) => s.actions.toggleCreditManager)

  const { data: creditAccountsList } = useCreditAccounts()
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || ''
  )

  const { firstCreditAccounts, restCreditAccounts } = useMemo(() => {
    return {
      firstCreditAccounts: creditAccountsList?.slice(0, MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
      restCreditAccounts: creditAccountsList?.slice(MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
    }
  }, [creditAccountsList])

  return (
    <div>
      {/* Main navigation bar */}
      <div className="flex items-center justify-between border-b border-white/20 px-6 py-3">
        <Link href="/" passHref>
          <a>
            <img src="/logo.svg" alt="mars" />
          </a>
        </Link>
        <div className="flex gap-5 px-12 text-white/40">
          {navItems.map((item, index) => (
            <NavLink key={index} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <Wallet />
      </div>
      {/* Sub navigation bar */}
      <div className="flex justify-between border-b border-white/20 px-6 py-3 text-sm text-white/40">
        <div className="flex items-center">
          <SearchInput />
          {firstCreditAccounts.map((account) => (
            <div
              key={account}
              className={`cursor-pointer px-4 hover:text-white ${
                selectedAccount === account ? 'text-white' : ''
              }`}
              onClick={() => setSelectedAccount(account)}
            >
              Account {account}
            </div>
          ))}
          {restCreditAccounts.length > 0 && (
            <Popover className="relative">
              <Popover.Button>
                <div className="flex cursor-pointer items-center px-3 hover:text-white">
                  More
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </div>
              </Popover.Button>
              <Popover.Panel className="absolute z-10 w-[200px] pt-2">
                <div className="rounded-2xl bg-white p-4 text-gray-900">
                  {restCreditAccounts.map((account) => (
                    <div
                      key={account}
                      className={`cursor-pointer hover:text-orange-500 ${
                        selectedAccount === account ? 'text-orange-500' : ''
                      }`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      Account {account}
                    </div>
                  ))}
                </div>
              </Popover.Panel>
            </Popover>
          )}
          <Popover className="relative">
            <Popover.Button>
              <div className="flex cursor-pointer items-center px-3 hover:text-white">
                Manage
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </div>
            </Popover.Button>
            <Popover.Panel className="absolute z-10 w-[200px] pt-2">
              {({ close }) => (
                <div className="rounded-2xl bg-white p-4 text-gray-900">
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => {
                      close()
                      createCreditAccount()
                    }}
                  >
                    Create Account
                  </div>
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => {
                      close()
                      deleteCreditAccount()
                    }}
                  >
                    Close Account
                  </div>
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => alert('TODO')}
                  >
                    Transfer Balance
                  </div>
                  <div
                    className="cursor-pointer hover:text-orange-500"
                    onClick={() => alert('TODO')}
                  >
                    Rearrange
                  </div>
                </div>
              )}
            </Popover.Panel>
          </Popover>
        </div>
        <div className="flex items-center gap-4">
          <p>{formatCurrency(2500)}</p>
          <div>Lvg</div>
          <div>Risk</div>
          <ProgressBar value={0.43} />
          <div
            className="flex w-16 cursor-pointer justify-center hover:text-white"
            onClick={toggleCreditManager}
          >
            <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor">
              <path d="M0.234863 6.57567C0.234863 7.07288 0.581403 7.41188 1.08615 7.41188H8.04708L9.62912 7.33655L7.45194 9.31785L5.93771 10.8547C5.77951 11.0129 5.68157 11.2163 5.68157 11.4574C5.68157 11.9244 6.02811 12.2634 6.50272 12.2634C6.72872 12.2634 6.93213 12.173 7.12047 11.9922L11.859 7.20094C11.9871 7.07288 12.0775 6.92221 12.1152 6.74894V11.5478C12.1152 12.0148 12.4692 12.3538 12.9363 12.3538C13.4109 12.3538 13.765 12.0148 13.765 11.5478V1.6111C13.765 1.14403 13.4109 0.797485 12.9363 0.797485C12.4692 0.797485 12.1152 1.14403 12.1152 1.6111V6.39486C12.0775 6.22913 11.9871 6.07846 11.859 5.95039L7.12047 1.15156C6.93213 0.970755 6.72872 0.880354 6.50272 0.880354C6.02811 0.880354 5.68157 1.22689 5.68157 1.68644C5.68157 1.92751 5.77951 2.13845 5.93771 2.28911L7.45194 3.83348L9.62912 5.80725L8.04708 5.73192H1.08615C0.581403 5.73192 0.234863 6.07846 0.234863 6.57567Z" />
            </svg>
          </div>
        </div>
      </div>
      {(isLoadingCreate || isLoadingDelete) && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default Navigation
