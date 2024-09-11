import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

export default function useCurrentAccountDeposits() {
  const account = useCurrentAccount()
  return account?.deposits ?? []
}
