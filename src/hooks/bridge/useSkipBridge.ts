import { useCallback, useEffect, useMemo, useState } from 'react'
import { SkipClient, StatusState, TxStatusResponse } from '@skip-go/client'
import { WalletClient } from 'viem'
import { getWalletClient } from '@wagmi/core'
import { config } from 'config/ethereumConfig'
import { chainNameToUSDCAttributes } from 'utils/fetchUSDCBalance'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { BN } from 'utils/helpers'
import useStore from 'store'
import useWalletBalances from 'hooks/wallet/useWalletBalances'

interface UseSkipBridgeProps {
  chainConfig: ChainConfig
  cosmosAddress?: string
  evmAddress?: string
  goFast?: boolean
}

export interface SkipBridgeTransaction {
  txHash: string
  chainID: string
  explorerLink: string
  status: StatusState
  denom: string
  amount: BigNumber
  id: string
}

export interface SkipTransactionInfo {
  txHash: string
  chainID: string
  explorerLink: string
}

export interface BridgeInfo {
  id: string
  name: string
  logo_uri: string
}

export function useSkipBridge({
  chainConfig,
  cosmosAddress,
  evmAddress,
  goFast,
}: UseSkipBridgeProps) {
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false)
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>(() => {
    const savedSkipBridges = localStorage.getItem('skipBridges')
    return savedSkipBridges && savedSkipBridges !== 'undefined' ? JSON.parse(savedSkipBridges) : []
  })

  const address = useStore((s) => s.address)
  const { mutate: refreshBalances } = useWalletBalances(address)

  const updateSkipBridges = useCallback(
    (newTransaction: SkipBridgeTransaction) => {
      const currentBridges = localStorage.getItem('skipBridges')
      const parsedBridges = currentBridges ? JSON.parse(currentBridges) : []
      const updatedBridges = parsedBridges.find(
        (b: SkipBridgeTransaction) => b.id === newTransaction.id,
      )
        ? parsedBridges.map((b: SkipBridgeTransaction) =>
            b.id === newTransaction.id ? newTransaction : b,
          )
        : [...parsedBridges, newTransaction]

      localStorage.setItem('skipBridges', JSON.stringify(updatedBridges))

      setSkipBridges(updatedBridges)

      useStore.setState((state) => ({
        ...state,
        skipBridgesUpdate: Date.now(),
      }))

      refreshBalances()
    },
    [refreshBalances],
  )

  const skipClient = useMemo(
    () =>
      new SkipClient({
        getCosmosSigner: async () => {
          const offlineSigner = window.keplr?.getOfflineSigner(chainConfig.id.toString())
          if (!offlineSigner) throw new Error('Keplr not installed')
          return offlineSigner
        },
        getEVMSigner: async (chainID: string) => {
          const evmWalletClient = (await getWalletClient(config, {
            chainId: parseInt(chainID),
          })) as WalletClient

          if (!evmWalletClient) {
            throw new Error(`getEVMSigner error: no wallet client available for chain ${chainID}`)
          }

          return evmWalletClient as any
        },
      }),
    [chainConfig],
  )

  const fetchSkipRoute = useCallback(
    async (selectedAsset: WrappedBNCoin) => {
      if (!selectedAsset.chain) throw new Error('Chain not found for selected asset')

      const expectedChainAttributes = chainNameToUSDCAttributes[selectedAsset.chain]
      if (!expectedChainAttributes) {
        throw new Error(`No chain attributes found for denom: ${selectedAsset.coin.denom}`)
      }

      if (chainConfig.id.toString() !== expectedChainAttributes.chainID.toString()) {
        const { switchChain } = await getWalletClient(config, {
          chainId: expectedChainAttributes.chainID,
        })

        if (switchChain) {
          await switchChain({ id: expectedChainAttributes.chainID })
        } else {
          throw new Error('Unable to switch network. Network switch function not available.')
        }
      }

      try {
        skipClient.bridges
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
    [chainConfig.id, skipClient, goFast, chainConfig.stables],
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

        const route = await fetchSkipRoute(selectedAsset)
        const amountOut = route.amountOut

        const userAddresses = route.requiredChainAddresses.map((chainID: string) => {
          if (chainID === chainConfig.id.toString()) {
            return { chainID, address: cosmosAddress }
          } else if (chainID === 'osmosis-1') {
            return { chainID, address: osmosisAddress || cosmosAddress }
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
      chainConfig.id,
      cosmosAddress,
      evmAddress,
      skipClient,
      skipBridges,
      updateSkipBridges,
      isBridgeInProgress,
      refreshBalances,
      fetchSkipRoute,
      chainConfig.stables,
    ],
  )

  const removeSkipBridge = useCallback((id: string) => {
    setSkipBridges((prev) => {
      const updated = prev.filter((b) => b.id !== id)
      localStorage.setItem('skipBridges', JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    if (skipBridges.some((b) => b.status === 'STATE_PENDING')) {
      const checkTransactionStatus = async () => {
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
      }

      const intervalId = setInterval(checkTransactionStatus, 10000)
      return () => clearInterval(intervalId)
    }
  }, [skipBridges, updateSkipBridges, refreshBalances])

  const fetchBridgeLogos = async ({ chainIDs }: { chainIDs: string[] }) => {
    try {
      const chains = await skipClient.chains({ chainIDs })
      const bridgeLogos = chains?.map((chain) => ({
        id: chain.chainID,
        name: chain.chainName,
        logo_uri: chain.logoURI ?? '',
      }))
      console.log('bridgeLogos', bridgeLogos)
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
