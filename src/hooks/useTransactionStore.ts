import { TRANSACTIONS_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

export default function useTransactionStore(): {
  transactions: ToastStore
  addTransaction: (transaction: ToastSuccess) => void
} {
  const [transactions, setTransactions] = useLocalStorage<ToastStore>(TRANSACTIONS_KEY, {
    recent: [],
  })
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
