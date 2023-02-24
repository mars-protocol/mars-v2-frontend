import { getBorrowData } from 'utils/api'

export default async function page() {
  const borrowData = await getBorrowData()

  return `You are a guest`
}
