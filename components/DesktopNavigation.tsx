import { Popover } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import Button from 'components/Button'
import CircularProgress from 'components/CircularProgress'
import ArrowRightLineIcon from 'components/Icons/arrow-right-line.svg'
import ChevronDownIcon from 'components/Icons/expand.svg'
import Logo from 'components/Icons/logo.svg'
import ProgressBar from 'components/ProgressBar'
import SearchInput from 'components/SearchInput'
import SemiCircleProgress from 'components/SemiCircleProgress'
import Wallet from 'components/Wallet'
import useCreateCreditAccount from 'hooks/mutations/useCreateCreditAccount'
import useDeleteCreditAccount from 'hooks/mutations/useDeleteCreditAccount'
import useAccountStats from 'hooks/useAccountStats'
import useCreditAccounts from 'hooks/useCreditAccounts'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
import { formatCurrency } from 'utils/formatters'

import TextLink from './TextLink'

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
  const isActive = router.pathname === href

  return (
    <Link href={href} passHref>
      <TextLink
        className={`${isActive && 'pointer-events-none text-white'}`}
        uppercase={true}
        textSize='large'
        color='quaternary'
      >
        {children}
      </TextLink>
    </Link>
  )
}

const Navigation = () => {
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const setSelectedAccount = useCreditManagerStore((s) => s.actions.setSelectedAccount)
  const toggleCreditManager = useCreditManagerStore((s) => s.actions.toggleCreditManager)

  const { data: creditAccountsList, isLoading: isLoadingCreditAccounts } = useCreditAccounts()
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || '',
  )

  const accountStats = useAccountStats()

  const { firstCreditAccounts, restCreditAccounts } = useMemo(() => {
    return {
      firstCreditAccounts: creditAccountsList?.slice(0, MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
      restCreditAccounts: creditAccountsList?.slice(MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
    }
  }, [creditAccountsList])

  const isConnected = !!address
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  const rightSideContent = () => {
    if ((!isConnected && !hasCreditAccounts) || isLoadingCreditAccounts) {
      return null
    }

    if (!hasCreditAccounts) {
      return <Button onClick={() => createCreditAccount()}>Create Credit Account</Button>
    }

    return (
      <div className='flex items-center gap-4'>
        {accountStats && (
          <>
            <p>
              {formatCurrency(
                BigNumber(accountStats.netWorth)
                  .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                  .toNumber(),
              )}
            </p>
            {/* TOOLTIP */}
            <div title={`${String(accountStats.currentLeverage.toFixed(1))}x`}>
              <SemiCircleProgress
                value={accountStats.currentLeverage / accountStats.maxLeverage}
                label='Lvg'
              />
            </div>
            <SemiCircleProgress value={accountStats.risk} label='Risk' />
            <ProgressBar value={accountStats.health} />
          </>
        )}
        <div
          className='flex w-16 cursor-pointer justify-center hover:text-white'
          onClick={toggleCreditManager}
        >
          <ArrowRightLineIcon />
        </div>
      </div>
    )
  }

  return (
    <div className='relative hidden lg:block'>
      <div className='flex items-center justify-between border-b border-white/20 px-6 py-3'>
        <div className='flex flex-grow items-center'>
          <Link href='/trade' passHref>
            <span className='h-10 w-10'>
              <Logo />
            </span>
          </Link>
          <div className='flex gap-8 px-6 text-white/40'>
            {navItems.map((item, index) => (
              <NavLink key={index} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Wallet />
      </div>
      {/* Sub navigation bar */}
      <div className='flex items-center justify-between border-b border-white/20 px-6 py-3 text-sm text-white/40'>
        <div className='flex items-center'>
          <SearchInput />
          {isConnected && hasCreditAccounts && (
            <>
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
                <Popover className='relative'>
                  <Popover.Button>
                    <div className='flex cursor-pointer items-center px-3 hover:text-white'>
                      More
                      <span className='ml-1 h-4 w-4'>
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </Popover.Button>
                  <Popover.Panel className='absolute z-10 w-[200px] pt-2'>
                    <div className='rounded-2xl bg-white p-4 text-gray-900'>
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
              <Popover className='relative'>
                <Popover.Button>
                  <div className='flex cursor-pointer items-center px-3 hover:text-white'>
                    Manage
                    <ChevronDownIcon className='ml-1 h-4 w-4' />
                  </div>
                </Popover.Button>
                <Popover.Panel className='absolute z-10 w-[200px] pt-2'>
                  {({ close }) => (
                    <div className='rounded-2xl bg-white p-4 text-gray-900'>
                      <div
                        className='mb-2 cursor-pointer hover:text-orange-500'
                        onClick={() => {
                          close()
                          createCreditAccount()
                        }}
                      >
                        Create Account
                      </div>
                      <div
                        className='mb-2 cursor-pointer hover:text-orange-500'
                        onClick={() => {
                          close()
                          deleteCreditAccount()
                        }}
                      >
                        Close Account
                      </div>
                      <div
                        className='mb-2 cursor-pointer hover:text-orange-500'
                        onClick={() => alert('TODO')}
                      >
                        Transfer Balance
                      </div>
                      <div
                        className='cursor-pointer hover:text-orange-500'
                        onClick={() => alert('TODO')}
                      >
                        Rearrange
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Popover>
            </>
          )}
        </div>
        {rightSideContent()}
      </div>
      {(isLoadingCreate || isLoadingDelete) && (
        <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
          <CircularProgress />
        </div>
      )}
    </div>
  )
}

export default Navigation
