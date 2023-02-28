'use client'

import useSWR from 'swr'

import useStore from 'store'
import { getPrices } from 'utils/api'

export default function FetchPrices() {
  useSWR('prices', getPrices, {
    refreshInterval: 30000,
    onSuccess: (prices) => useStore.setState({ prices }),
  })

  return null
}
