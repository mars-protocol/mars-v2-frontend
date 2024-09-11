import useTransactions from '../localStorage/useTransactions'

export default function useTransactionStore(): {
  transactions: ToastStore
  addTransaction: (transaction: ToastSuccess) => void
} {
  const [transactions, setTransactions] = useTransactions()
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
