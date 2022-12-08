import Link from 'next/link'

import { AccountNavigation, AccountStatus } from 'components/Account'
import Logo from 'components/Icons/logo.svg'
import { menuTree, NavLink } from 'components/Navigation'
import SearchInput from 'components/Navigation/SearchInput'
import Wallet from 'components/Wallet/Wallet'
import useCreditAccounts from 'hooks/useCreditAccounts'
import { useAccountDetailsStore, useWalletStore } from 'stores'

const Navigation = () => {
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { data: creditAccountsList } = useCreditAccounts()

  const isConnected = !!address
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  return (
    <div className='relative hidden bg-header lg:block'>
      <div className='flex items-center justify-between border-b border-white/20 px-6 py-3'>
        <div className='flex flex-grow items-center'>
          <Link href='/trade' passHref>
            <span className='h-10 w-10'>
              <Logo />
            </span>
          </Link>
          <div className='flex gap-8 px-6'>
            {menuTree.map((item, index) => (
              <NavLink key={index} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Wallet />
      </div>
      {/* Sub navigation bar */}
      <div className='flex items-center justify-between border-b border-white/20 pl-6 text-sm text-white/40'>
        <div className='flex items-center'>
          <SearchInput />
          {isConnected && hasCreditAccounts && (
            <AccountNavigation
              selectedAccount={selectedAccount}
              creditAccountsList={creditAccountsList}
            />
          )}
        </div>
        {isConnected && <AccountStatus />}
      </div>
    </div>
  )
}

export default Navigation
