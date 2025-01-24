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

export function useSkipBridge({ chainConfig, cosmosAddress, evmAddress }: UseSkipBridgeProps) {
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false)
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>(() => {
    const savedSkipBridges = localStorage.getItem('skipBridges')
    return savedSkipBridges && savedSkipBridges !== 'undefined' ? JSON.parse(savedSkipBridges) : []
  })

  const address = useStore((s) => s.address)
  const { mutate: refreshBalances } = useWalletBalances(address)

  const updateSkipBridges = useCallback(
    (newTransaction: SkipBridgeTransaction) => {
      // First update localStorage immediately
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

      // Then update state
      setSkipBridges(updatedBridges)

      // Force update store to trigger re-renders
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

  const handleSkipTransfer = useCallback(
    async (selectedAsset: WrappedBNCoin, minimumAmount: number) => {
      if (isBridgeInProgress) {
        return
      }

      if (!cosmosAddress || !evmAddress || !selectedAsset) {
        console.error('Missing required data for transfer')
        return
      }

      try {
        setIsBridgeInProgress(true)
        if (!selectedAsset.chain) throw new Error('Chain not found for selected asset')

        let osmosisAddress = ''
        try {
          if (window.keplr) {
            await window.keplr.enable('osmosis-1')
            const key = await window.keplr.getKey('osmosis-1')
            osmosisAddress = key.bech32Address
          }
        } catch (error) {
          console.error('Failed to get Osmosis address:', error)
        }

        const expectedChainAttributes = chainNameToUSDCAttributes[selectedAsset.chain]
        if (!expectedChainAttributes) {
          console.error(`No chain attributes found for denom: ${selectedAsset.coin.denom}`)
          return
        }

        if (chainConfig.id.toString() !== expectedChainAttributes.chainID.toString()) {
          const { switchChain } = await getWalletClient(config, {
            chainId: expectedChainAttributes.chainID,
          })

          if (switchChain) {
            await switchChain({ id: expectedChainAttributes.chainID })
          } else {
            console.error('Unable to switch network. Network switch function not available.')
            return
          }
        }

        if (BN(selectedAsset.coin.amount).isLessThan(minimumAmount)) {
          return false
        }

        const route = await skipClient.route({
          allowMultiTx: true,
          allowUnsafe: true,
          cumulativeAffiliateFeeBPS: '0',
          experimentalFeatures: ['hyperlane'],
          smartRelay: true,
          smartSwapOptions: {
            splitRoutes: true,
            evmSwaps: true,
          },
          sourceAssetDenom: chainNameToUSDCAttributes[selectedAsset.chain].assetAddress,
          sourceAssetChainID: chainNameToUSDCAttributes[selectedAsset.chain].chainID.toString(),
          destAssetDenom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
          destAssetChainID: chainConfig.id.toString(),
          amountIn: selectedAsset.coin.amount.toString(),
        })

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

        await skipClient.executeRoute({
          route,
          userAddresses,
          slippageTolerancePercent: '3',
          onTransactionTracked: async (txInfo: {
            txHash: string
            chainID: string
            explorerLink: string
          }) => {
            updateSkipBridges({
              ...txInfo,
              id: transactionId,
              denom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
              amount: selectedAsset.coin.amount,
              status: 'STATE_PENDING',
            })

            // Close the fund modal once the transaction is tracked
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
              denom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
              amount: selectedAsset.coin.amount,
            })
            setIsBridgeInProgress(false)
            // Refresh balances when transaction is completed
            refreshBalances()
          },
        })

        return true
      } catch (error) {
        console.error('Skip transfer failed:', error)
        if (error instanceof Error) {
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
        setIsBridgeInProgress(false)
        return false
      }
    },
    [
      chainConfig,
      cosmosAddress,
      evmAddress,
      skipClient,
      skipBridges,
      updateSkipBridges,
      isBridgeInProgress,
      refreshBalances,
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

  return {
    skipBridges,
    isBridgeInProgress,
    handleSkipTransfer,
    removeSkipBridge,
  }
}
