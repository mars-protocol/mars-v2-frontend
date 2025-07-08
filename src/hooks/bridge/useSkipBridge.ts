import { chains, executeRoute, route } from '@skip-go/client'
import { useEvmBridge } from 'hooks/bridge/useEvmBridge'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { calculateUsdcFeeReserve, isUsdcFeeToken } from 'utils/feeToken'
import { BN } from 'utils/helpers'
import { convertToSkipAddresses } from 'utils/wallet'

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

  const fetchSkipRoute = useCallback(
    async (selectedAsset: WrappedBNCoin) => {
      try {
        const expectedChainAttributes = await switchEvmChain(selectedAsset, chainConfig)

        const response = await route({
          sourceAssetDenom: expectedChainAttributes.assetAddress,
          sourceAssetChainId: expectedChainAttributes.chainID.toString(),
          destAssetDenom: chainConfig.stables[0],
          destAssetChainId: chainConfig.id.toString(),
          allowUnsafe: true,
          experimentalFeatures: ['hyperlane', 'stargate'],
          allowMultiTx: false,
          cumulativeAffiliateFeeBps: '0',
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
    [goFast, chainConfig, switchEvmChain],
  )

  const handleSkipTransfer = useCallback(
    async (selectedAsset: WrappedBNCoin, minimumAmount: number, isNewAccount: boolean) => {
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
        const usdcAsFeeToken = isUsdcFeeToken(chainConfig)

        let bridgeAmount = selectedAsset.coin.amount.toString()
        if (isUsdc && usdcAsFeeToken) {
          const { depositAmount } = calculateUsdcFeeReserve(bridgeAmount, chainConfig)
          bridgeAmount = depositAmount

          if (BN(depositAmount).isLessThanOrEqualTo(0)) {
            setIsBridgeInProgress(false)
            return false
          }
        }

        const skipAddresses = convertToSkipAddresses(cosmosAddress)

        const adjustedAsset =
          isUsdc && usdcAsFeeToken
            ? WrappedBNCoin.fromDenomAndBigNumber(
                selectedAsset.coin.denom,
                BN(bridgeAmount),
                selectedAsset.chain,
              )
            : selectedAsset

        const route = await fetchSkipRoute(adjustedAsset)
        if (!route) {
          setIsBridgeInProgress(false)
          return false
        }
        const amountOut = route.amountOut

        const userAddresses = route.requiredChainAddresses.map((chainID: string) => {
          const address =
            chainID === 'neutron-1'
              ? (skipAddresses?.['neutron-1'] ?? cosmosAddress)
              : chainID === 'osmosis-1'
                ? (skipAddresses?.['osmosis-1'] ?? cosmosAddress)
                : chainID === 'noble-1'
                  ? (skipAddresses?.['noble-1'] ?? cosmosAddress)
                  : evmAddress
          return { chainId: chainID, address }
        })

        const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        try {
          await executeRoute({
            route,
            userAddresses,
            slippageTolerancePercent: '3',
            getCosmosSigner: async () => {
              const offlineSigner = window.keplr?.getOfflineSigner(chainConfig.id.toString())
              if (!offlineSigner) throw new Error('Keplr not installed')
              return offlineSigner
            },
            getEvmSigner,
            onTransactionTracked: async (txInfo) => {
              updateSkipBridges({
                ...txInfo,
                id: transactionId,
                denom: chainConfig.stables[0],
                amount: BN(amountOut),
                status: 'STATE_PENDING',
                asset: selectedAsset.coin.denom,
                chainID: chainConfig.id,
              })
              if (!isNewAccount) {
                useStore.setState({
                  fundAndWithdrawModal: null,
                })
              }
              refreshBalances()
            },
            onTransactionCompleted: async (txInfo) => {
              updateSkipBridges({
                ...txInfo,
                id: transactionId,
                explorerLink: skipBridges.find((b) => b.id === transactionId)?.explorerLink ?? '',
                status: (txInfo.status ?? 'STATE_COMPLETED').toString(),
                denom: chainConfig.stables[0],
                amount: BN(amountOut),
                asset: selectedAsset.coin.denom,
                chainID: chainConfig.id,
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
      getEvmSigner,
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
      const chainsList = await chains({})
      const bridgeLogos = chainIDs.slice(1).map((chainID) => {
        const chainItem: any = chainsList?.find(
          (c: any) => c.chainId === chainID || c.chain_id === chainID,
        )
        const name = chainItem?.chainName ?? chainItem?.chain_name ?? chainID
        const logo = chainItem?.logoUri ?? chainItem?.logo_uri ?? ''
        return {
          id: chainID,
          name,
          logo_uri: logo,
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
