import useCurrentAccount from 'hooks/useCurrentAccount'

export default function useCurrentAccountLends() {
  const account = useCurrentAccount()
  return account?.lends ?? []
}
