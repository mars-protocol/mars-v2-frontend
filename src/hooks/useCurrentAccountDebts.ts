import useCurrentAccount from 'hooks/useCurrentAccount'

export default function useCurrentAccountDebts() {
  const account = useCurrentAccount()
  return account?.debts ?? []
}
