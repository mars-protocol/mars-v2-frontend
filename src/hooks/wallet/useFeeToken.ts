import { NetworkCurrency } from '@delphi-labs/shuttle'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentFeeToken } from 'utils/feeToken'

export default function useFeeToken() {
  const chainConfig = useChainConfig()
  const currentFeeToken = getCurrentFeeToken(chainConfig)
  const [selectedFeeToken, setSelectedFeeToken] = useState<NetworkCurrency | undefined>(undefined)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(
        `${chainConfig.id}/${LocalStorageKeys.MARS_FEE_TOKEN}`,
      )
      if (savedToken) {
        const parsedToken = JSON.parse(savedToken) as NetworkCurrency
        setSelectedFeeToken(parsedToken)
      }
    } catch (error) {
      console.error('Failed to load fee token from localStorage:', error)
    }
  }, [chainConfig.id])

  const feeToken = selectedFeeToken || currentFeeToken

  const setFeeToken = useCallback(
    (token: NetworkCurrency) => {
      setSelectedFeeToken(token)
      try {
        localStorage.setItem(
          `${chainConfig.id}/${LocalStorageKeys.MARS_FEE_TOKEN}`,
          JSON.stringify(token),
        )
      } catch (error) {
        console.error('Failed to save fee token to localStorage:', error)
      }
    },
    [chainConfig.id],
  )

  return useMemo(() => {
    return { feeToken, setFeeToken }
  }, [feeToken, setFeeToken])
}
