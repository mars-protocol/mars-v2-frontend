import { SkipClient, TxStatusResponse } from '@skip-go/client'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { calculateUsdcFeeReserve, isUsdcFeeToken } from 'utils/feeToken'
import { BN } from 'utils/helpers'
import { useEvmBridge } from './useEvmBridge'

interface UseSkipBridgeProps {
  chainConfig: ChainConfig
  cosmosAddress?: string
  evmAddress?: string
  goFast?: boolean
}

export function useSkipBridge({
  chainConfig,
  cosmosAddress,
  evmAddress,
  goFast,
}: UseSkipBridgeProps) {
  const { getEvmSigner, switchEvmChain } = useEvmBridge()
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false)
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>(() => {
    const savedSkipBridges = localStorage.getItem(`${chainConfig.id}/skipBridges`)
    return savedSkipBridges && savedSkipBridges !== 'undefined' ? JSON.parse(savedSkipBridges) : []
  })

  const { mutate: refreshBalances } = useWalletBalances(cosmosAddress)

  const updateSkipBridges = useCallback(
    (newTransaction: SkipBridgeTransaction) => {
      const currentBridges = localStorage.getItem(`${chainConfig.id}/skipBridges`)
      const parsedBridges = currentBridges ? JSON.parse(currentBridges) : []
      const updatedBridges = parsedBridges.find(
        (b: SkipBridgeTransaction) => b.id === newTransaction.id,
      )
        ? parsedBridges.map((b: SkipBridgeTransaction) =>
            b.id === newTransaction.id ? newTransaction : b,
          )
        : [...parsedBridges, newTransaction]

      localStorage.setItem(`${chainConfig.id}/skipBridges`, JSON.stringify(updatedBridges))

      setSkipBridges(updatedBridges)

      useStore.setState((state) => ({
        ...state,
        skipBridgesUpdate: Date.now(),
      }))

      refreshBalances()
    },
    [chainConfig.id, refreshBalances],
  )

  const skipClient = useMemo(
    () =>
      new SkipClient({
        getCosmosSigner: async () => {
          const offlineSigner = window.keplr?.getOfflineSigner(chainConfig.id.toString())
          if (!offlineSigner) throw new Error('Keplr not installed')
          return offlineSigner
        },
        getEVMSigner: getEvmSigner,
      }),
    [chainConfig, getEvmSigner],
  )

  const fetchSkipRoute = useCallback(
    async (selectedAsset: WrappedBNCoin) => {
      try {
        const expectedChainAttributes = await switchEvmChain(selectedAsset, chainConfig)

        const response = await skipClient.route({
          sourceAssetDenom: expectedChainAttributes.assetAddress,
          sourceAssetChainID: expectedChainAttributes.chainID.toString(),
          destAssetDenom: chainConfig.stables[0],
          destAssetChainID: chainConfig.id.toString(),
          allowUnsafe: true,
          experimentalFeatures: ['hyperlane', 'stargate'],
          allowMultiTx: false,
          cumulativeAffiliateFeeBPS: '0',
          smartRelay: true,
          smartSwapOptions: {
            splitRoutes: true,
            evmSwaps: true,
          },
          goFast: goFast ?? true,
          amountIn: selectedAsset.coin.amount.toString(),
        })
        return response
      } catch (error: any) {
        if (error.response?.data) {
          const errorMessage = error.response.data.message || error.response.data.error
          throw new Error(errorMessage || 'Failed to fetch route')
        }
        throw error
      }
    },
    [skipClient, goFast, chainConfig, switchEvmChain],
  )

  const handleSkipTransfer = useCallback(
    async (selectedAsset: WrappedBNCoin, minimumAmount: number) => {
      if (isBridgeInProgress) return
      if (!cosmosAddress || !evmAddress || !selectedAsset) {
        console.error('Missing required data for transfer')
        return false
      }

      try {
        setIsBridgeInProgress(true)

        if (BN(selectedAsset.coin.amount).isLessThan(minimumAmount)) {
          setIsBridgeInProgress(false)
          return false
        }

        const isUsdc =
          selectedAsset.coin.denom.includes('usdc') || selectedAsset.coin.denom.includes('uusdc')
        const usdcAsFeeToken = isUsdcFeeToken()

        let bridgeAmount = selectedAsset.coin.amount.toString()
        if (isUsdc && usdcAsFeeToken) {
          const { depositAmount } = calculateUsdcFeeReserve(bridgeAmount, chainConfig)
          bridgeAmount = depositAmount

          if (BN(depositAmount).isLessThanOrEqualTo(0)) {
            setIsBridgeInProgress(false)
            return false
          }
        }

        let osmosisAddress = ''
        try {
          if (window.keplr) {
            await window.keplr.enable('osmosis-1')
            const key = await window.keplr.getKey('osmosis-1')
            osmosisAddress = key.bech32Address
          }
        } catch (error) {
          console.error('Failed to get Osmosis address:', error)
          setIsBridgeInProgress(false)
          return false
        }

        let nobleAddress = ''
        try {
          if (window.keplr) {
            await window.keplr.enable('noble-1')
            const key = await window.keplr.getKey('noble-1')
            nobleAddress = key.bech32Address
          }
        } catch (error) {
          console.error('Failed to get Noble address:', error)
        }

        let neutronAddress = ''
        try {
          if (window.keplr) {
            await window.keplr.enable('neutron-1')
            const key = await window.keplr.getKey('neutron-1')
            neutronAddress = key.bech32Address
          }
        } catch (error) {
          console.error('Failed to get Neutron address:', error)
        }

        const adjustedAsset =
          isUsdc && usdcAsFeeToken
            ? WrappedBNCoin.fromDenomAndBigNumber(
                selectedAsset.coin.denom,
                BN(bridgeAmount),
                selectedAsset.chain,
              )
            : selectedAsset

        const route = await fetchSkipRoute(adjustedAsset)
        const amountOut = route.amountOut

        const userAddresses = route.requiredChainAddresses.map((chainID: string) => {
          if (chainID === 'neutron-1') {
            return { chainID, address: neutronAddress || cosmosAddress }
          } else if (chainID === 'osmosis-1') {
            return { chainID, address: osmosisAddress || cosmosAddress }
          } else if (chainID === 'noble-1') {
            return { chainID, address: nobleAddress || cosmosAddress }
          } else {
            return { chainID, address: evmAddress }
          }
        })

        const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        try {
          await skipClient.executeRoute({
            route,
            userAddresses,
            slippageTolerancePercent: '3',
            onTransactionTracked: async (txInfo: SkipTransactionInfo) => {
              updateSkipBridges({
                ...txInfo,
                id: transactionId,
                denom: chainConfig.stables[0],
                amount: BN(amountOut),
                status: 'STATE_PENDING',
              })

              useStore.setState((state) => ({
                ...state,
                fundAndWithdrawModal: null,
                walletAssetsModal: null,
                focusComponent: null,
              }))

              refreshBalances()
            },
            onTransactionCompleted: async (
              chainID: string,
              txHash: string,
              status: TxStatusResponse,
            ) => {
              updateSkipBridges({
                txHash,
                chainID,
                id: transactionId,
                explorerLink: skipBridges.find((b) => b.id === transactionId)?.explorerLink ?? '',
                status: status.status,
                denom: chainConfig.stables[0],
                amount: BN(amountOut),
              })
              setIsBridgeInProgress(false)
              refreshBalances()
            },
          })
        } catch (error: any) {
          setIsBridgeInProgress(false)

          if (error.name === 'ContractFunctionExecutionError') {
            return false
          }

          const errorMessage = error.message?.toLowerCase() || ''
          if (
            errorMessage.includes('user rejected') ||
            errorMessage.includes('user denied') ||
            errorMessage.includes('rejected by user') ||
            errorMessage.includes('cancelled') ||
            errorMessage.includes('rejected the request')
          ) {
            return false
          }

          console.error('Transaction execution failed:', error)
          throw error
        }

        return true
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message?.toLowerCase().includes('reject') &&
          !error.message?.toLowerCase().includes('denied')
        ) {
          console.error('Skip transfer failed:', error)
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
        setIsBridgeInProgress(false)
        return false
      }
    },
    [
      cosmosAddress,
      evmAddress,
      skipClient,
      skipBridges,
      updateSkipBridges,
      isBridgeInProgress,
      refreshBalances,
      fetchSkipRoute,
      chainConfig,
    ],
  )

  const removeSkipBridge = useCallback(
    (id: string) => {
      setSkipBridges((prev) => {
        const updated = prev.filter((b) => b.id !== id)
        localStorage.setItem(`${chainConfig.id}/skipBridges`, JSON.stringify(updated))
        return updated
      })
    },
    [chainConfig.id],
  )

  const checkTransactionStatus = useCallback(async () => {
    try {
      await Promise.all(
        skipBridges
          .filter((bridge) => bridge.status === 'STATE_PENDING')
          .map(async (bridge) => {
            const response = await fetch(
              `https://api.skip.build/v2/tx/status?chain_id=${bridge.chainID}&tx_hash=${bridge.txHash}`,
            )
            const skipStatus = await response.json()

            if (skipStatus.status === 'STATE_COMPLETED') {
              updateSkipBridges({
                ...bridge,
                status: 'STATE_COMPLETED',
              })
              refreshBalances()
            }
          }),
      )
    } catch (error) {
      console.error('Failed to fetch Skip status:', error)
    }
  }, [skipBridges, updateSkipBridges, refreshBalances])

  useEffect(() => {
    if (skipBridges.some((b) => b.status === 'STATE_PENDING')) {
      const intervalId = setInterval(checkTransactionStatus, 10000)
      return () => clearInterval(intervalId)
    }
  }, [skipBridges, updateSkipBridges, refreshBalances, checkTransactionStatus])

  const fetchBridgeLogos = async ({ chainIDs }: { chainIDs: string[] }) => {
    try {
      const chains = await skipClient.chains({ chainIDs })
      const bridgeLogos = chainIDs.slice(1).map((chainID) => {
        const chain = chains?.find((c) => c.chainID === chainID)
        return {
          id: chainID,
          name: chain?.chainName ?? chainID,
          logo_uri: chain?.logoURI ?? '',
        }
      })
      return bridgeLogos
    } catch (error) {
      console.error('Failed to fetch bridge logos:', error)
      return []
    }
  }

  return {
    skipBridges,
    isBridgeInProgress,
    handleSkipTransfer,
    removeSkipBridge,
    fetchSkipRoute,
    fetchBridgeLogos,
  }
}
