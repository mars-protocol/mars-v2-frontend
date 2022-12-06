import Link from 'next/link'

import { AccountNavigation, AccountStatus } from 'components/Account'
import CircularProgress from 'components/CircularProgress'
import Logo from 'components/Icons/logo.svg'
import Modal from 'components/Modal'
import { menuTree, NavLink } from 'components/Navigation'
import SearchInput from 'components/Navigation/SearchInput'
import Text from 'components/Text'
import Wallet from 'components/Wallet'
import useCreateCreditAccount from 'hooks/mutations/useCreateCreditAccount'
import useDeleteCreditAccount from 'hooks/mutations/useDeleteCreditAccount'
import useCreditAccounts from 'hooks/useCreditAccounts'
import useAccountDetailsStore from 'stores/useAccountDetailsStore'
import useWalletStore from 'stores/useWalletStore'

const Navigation = () => {
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || '',
  )

  const { data: creditAccountsList, isLoading: isLoadingCreditAccounts } = useCreditAccounts()

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
              createCreditAccount={createCreditAccount}
              deleteCreditAccount={deleteCreditAccount}
              creditAccountsList={creditAccountsList}
            />
          )}
        </div>
        {isConnected && <AccountStatus createCreditAccount={createCreditAccount} />}
      </div>
      <Modal open={isLoadingCreate || isLoadingDelete}>
        <div className='w-full p-6'>
          <Text size='2xl' uppercase={true} className='mb-6 w-full text-center'>
            Confirm Transaction
          </Text>
          <div className='flex w-full justify-center pb-6'>
            <CircularProgress size={40} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Navigation
