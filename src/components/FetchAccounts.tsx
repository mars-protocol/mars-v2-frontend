'use client'

import useSWR from 'swr'

import useParams from 'hooks/useParams'
import useStore from 'store'
import { getCreditAccounts } from 'utils/api'

export default function FechCreditAccounts() {
  const params = useParams()
  useSWR('creditAccounts', () => getCreditAccounts(params.wallet), {
    onSuccess: (creditAccounts) => useStore.setState({ creditAccounts }),
  })

  return null
}
