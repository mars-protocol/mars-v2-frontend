import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

export default function useCurrentAccountLends() {
  const account = useCurrentAccount()
  return account?.lends ?? []
}
