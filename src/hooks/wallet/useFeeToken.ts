import { NetworkCurrency } from '@delphi-labs/shuttle'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useBestFeeToken from 'hooks/prices/useBestFeeToken'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function useFeeToken() {
  const defaultFeeToken = useBestFeeToken()
  const [selectedFeeToken, setSelectedFeeToken] = useState<NetworkCurrency | undefined>(undefined)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(LocalStorageKeys.MARS_FEE_TOKEN)
      if (savedToken) {
        const parsedToken = JSON.parse(savedToken) as NetworkCurrency
        setSelectedFeeToken(parsedToken)
      }
    } catch (error) {
      console.error('Failed to load fee token from localStorage:', error)
    }
  }, [])

  const feeToken = selectedFeeToken || defaultFeeToken

  const setFeeToken = useCallback((token: NetworkCurrency) => {
    setSelectedFeeToken(token)
    try {
      localStorage.setItem(LocalStorageKeys.MARS_FEE_TOKEN, JSON.stringify(token))
    } catch (error) {
      console.error('Failed to save fee token to localStorage:', error)
    }
  }, [])

  return useMemo(() => {
    return { feeToken, setFeeToken }
  }, [feeToken, setFeeToken])
}

export function getCurrentFeeToken(): NetworkCurrency | undefined {
  try {
    const savedToken = localStorage.getItem(LocalStorageKeys.MARS_FEE_TOKEN)
    if (savedToken) {
      return JSON.parse(savedToken) as NetworkCurrency
    }
  } catch (error) {
    console.error('Failed to get fee token from localStorage:', error)
  }
  return undefined
}
