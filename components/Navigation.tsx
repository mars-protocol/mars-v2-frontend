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
import useAccountStats from 'hooks/useAccountStats'
import SemiCircleProgress from './SemiCircleProgress'
import useWalletStore from 'stores/useWalletStore'
import ArrowRightLine from 'components/Icons/arrow-right-line.svg'

// TODO: will require some tweaks depending on how lower viewport mocks pans out
const MAX_VISIBLE_CREDIT_ACCOUNTS = 5

const navItems = [
  { href: '/trade', label: 'Trade' },
  { href: '/earn', label: 'Earn' },
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
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const setSelectedAccount = useCreditManagerStore((s) => s.actions.setSelectedAccount)
  const toggleCreditManager = useCreditManagerStore((s) => s.actions.toggleCreditManager)

  const { data: creditAccountsList } = useCreditAccounts()
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || ''
  )

  const accountStats = useAccountStats()

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
      {address && (
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
            {accountStats && (
              <>
                <p>{formatCurrency(accountStats.netWorth)}</p>
                {/* TOOLTIP */}
                <div title={`${String(accountStats.currentLeverage.toFixed(1))}x`}>
                  <SemiCircleProgress value={accountStats.leverage} label="Lvg" />
                </div>
                <SemiCircleProgress value={accountStats.risk} label="Risk" />
                <ProgressBar value={accountStats.health} />
              </>
            )}
            <div
              className="flex w-16 cursor-pointer justify-center hover:text-white"
              onClick={toggleCreditManager}
            >
              <ArrowRightLine />
            </div>
          </div>
        </div>
      )}
      {(isLoadingCreate || isLoadingDelete) && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default Navigation
