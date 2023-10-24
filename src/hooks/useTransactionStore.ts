import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'

export default function useTransactionStore(): {
  transactions: ToastStore
  addTransaction: (transaction: ToastSuccess) => void
} {
  const [transactions, setTransactions] = useLocalStorage<ToastStore>(
    LocalStorageKeys.TRANSACTIONS,
    {
      recent: [],
    },
  )
  const recentTransactions = transactions.recent
  const addTransaction = (transaction: ToastSuccess) => {
    recentTransactions.push(transaction)
    setTransactions({ recent: recentTransactions })
  }

  return {
    transactions,
    addTransaction,
  }
}
