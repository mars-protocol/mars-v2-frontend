import { Popover } from '@headlessui/react'
import Link from 'next/link'
import { useMemo } from 'react'

import CircularProgress from 'components/CircularProgress'
import ChevronDownIcon from 'components/Icons/expand.svg'
import Logo from 'components/Icons/logo.svg'
import Modal from 'components/Modal'
import { menuTree, NavLink } from 'components/Navigation'
import SearchInput from 'components/SearchInput'
import { AccountStatus, SubAccountNavigation } from 'components/SubAccount'
import Text from 'components/Text'
import Wallet from 'components/Wallet'
import useCreateCreditAccount from 'hooks/mutations/useCreateCreditAccount'
import useDeleteCreditAccount from 'hooks/mutations/useDeleteCreditAccount'
import useCreditAccounts from 'hooks/useCreditAccounts'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'

const Navigation = () => {
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const setSelectedAccount = useCreditManagerStore((s) => s.actions.setSelectedAccount)
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || '',
  )

  const { data: creditAccountsList, isLoading: isLoadingCreditAccounts } = useCreditAccounts()

  const isConnected = !!address
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

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
            <SubAccountNavigation
              selectedAccount={selectedAccount}
              createCreditAccount={createCreditAccount}
              deleteCreditAccount={deleteCreditAccount}
              setSelectedAccount={setSelectedAccount}
              creditAccountsList={creditAccountsList}
            />
          )}
        </div>
        {isConnected && <AccountStatus createCreditAccount={createCreditAccount} />}
      </div>
      <Modal open={isLoadingCreate || isLoadingDelete}>
        <Text size='2xl' uppercase={true} className='mb-6 w-full text-center'>
          Confirm Transaction
        </Text>
        <div className='flex w-full justify-center pb-6'>
          <CircularProgress size={40} />
        </div>
      </Modal>
    </div>
  )
}

export default Navigation
