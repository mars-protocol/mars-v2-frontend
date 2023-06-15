import useCurrentAccount from 'hooks/useCurrentAccount'

export default function useCurrentAccountDeposits() {
  const account = useCurrentAccount()
  return account?.deposits ?? []
}
