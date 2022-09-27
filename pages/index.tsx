import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
// import Head from "next/head";
// import Image from "next/image";
// import styles from "../styles/Home.module.css";
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
// import { Coin } from "@cosmjs/stargate";
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import { useQueryClient } from '@tanstack/react-query'

import Container from 'components/Container'
import Button from 'components/Button'
import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import Spinner from 'components/Spinner'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { queryKeys } from 'types/query-keys-factory'

const Home: NextPage = () => {
  const [sendAmount, setSendAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')

  const [allTokens, setAllTokens] = useState<string[] | null>(null)
  const [walletTokens, setWalletTokens] = useState<string[] | null>(null)

  const [borrowAmount, setBorrowAmount] = useState(0)

  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const address = useWalletStore((state) => state.address)
  const selectedAccount = useCreditManagerStore((state) => state.selectedAccount)
  const queryClient = useQueryClient()

  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>()

  useEffect(() => {
    ;(async () => {
      if (!window.keplr) return

      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)
      const clientInstance = await SigningCosmWasmClient.connectWithSigner(chain.rpc, offlineSigner)

      setSigningClient(clientInstance)
    })()
  }, [address])

  const handleSendClick = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // console.log(await signingClient.getHeight());

      // console.log(
      //   "contract info",
      //   signingClient.getContract(
      //     "osmo1zf26ahe5gqjtvnedh7ems7naf2wtw3z4ll6atf3t0hptal8ss4vq2mlx6w"
      //   )
      // );

      const res = await signingClient?.sendTokens(
        address,
        recipientAddress,
        [
          {
            denom: chain.stakeCurrency.coinMinimalDenom,
            amount: BigNumber(sendAmount)
              .times(10 ** chain.stakeCurrency.coinDecimals)
              .toString(),
          },
        ],
        hardcodedFee
      )

      console.log('txResponse', res)
      toast.success(
        <div>
          <a
            href={`https://testnet.mintscan.io/osmosis-testnet/txs/${res?.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            Check transaction
          </a>
        </div>,
        { autoClose: false }
      )
    } catch (e: any) {
      console.log(e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCreditAccount = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // 200000 gas used
      const executeMsg = {
        create_credit_account: {},
      }

      const createResult = await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee
      )

      console.log('mint result', createResult)
      toast.success(
        <div>
          <a
            href={`https://testnet.mintscan.io/osmosis-testnet/txs/${createResult?.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            Check transaction
          </a>
        </div>,
        { autoClose: false }
      )

      queryClient.invalidateQueries(queryKeys.creditAccounts(address))
    } catch (e: any) {
      console.log(e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  // https://github.com/mars-protocol/rover/blob/master/scripts/types/generated/account-nft/AccountNft.types.ts
  const handleGetCreditAccounts = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const allTokensQueryMsg = {
        all_tokens: {},
      }

      const allTokensResponse = await signingClient?.queryContractSmart(
        contractAddresses.accountNft,
        allTokensQueryMsg
      )

      setAllTokens(allTokensResponse.tokens)

      console.log('all tokens', allTokensResponse)

      // Returns de owner of a specific "credit account"
      // const ownerOfQueryMsg = {
      //   owner_of: {
      //     include_expired: false,
      //     token_id: "1",
      //   },
      // };

      // const ownerResponse = await signingClient.queryContractSmart(
      //   contractAddresses.accountNft,
      //   ownerOfQueryMsg
      // );

      // console.log("res owner", ownerResponse);

      const tokensQueryMsg = {
        tokens: {
          owner: address,
        },
      }

      const tokensResponse = await signingClient?.queryContractSmart(
        contractAddresses.accountNft,
        tokensQueryMsg
      )

      console.log('res tokens', tokensResponse)
      setWalletTokens(tokensResponse.tokens)
    } catch (e: any) {
      console.log(e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBorrowClick = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (!selectedAccount) return

      const executeMsg = {
        update_credit_account: {
          account_id: selectedAccount,
          actions: [
            {
              borrow: {
                denom: 'uosmo',
                amount: BigNumber(borrowAmount)
                  .times(10 ** 6)
                  .toString(),
              },
            },
          ],
        },
      }

      const borrowResult = await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee
      )

      console.log('borrow result', borrowResult)
      toast.success(
        <div>
          <a
            href={`https://testnet.mintscan.io/osmosis-testnet/txs/${borrowResult?.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            Check transaction
          </a>
        </div>,
        { autoClose: false }
      )

      queryClient.invalidateQueries(queryKeys.creditAccounts(address))
      queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount))
      queryClient.invalidateQueries(queryKeys.tokenBalance(address, 'uosmo'))
    } catch (e: any) {
      console.log(e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-6 max-w-6xl mx-auto">
      <Container>
        <h4 className="text-xl mb-5">Send Tokens</h4>
        <div className="flex flex-wrap gap-2 mb-5">
          <div>
            <p>Address:</p>
            <input
              className="rounded-lg px-3 py-1 bg-black/40"
              value={recipientAddress}
              placeholder="address"
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div>
            <p>Amount:</p>
            <input
              type="number"
              className="rounded-lg px-3 py-1 bg-black/40"
              value={sendAmount}
              placeholder="amount"
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
        </div>
        <Button className="bg-[#524bb1] hover:bg-[#6962cc]" onClick={handleSendClick}>
          Send
        </Button>
      </Container>
      <Container>
        <h4 className="text-xl mb-5">Create Credit Account (Mint NFT)</h4>
        <Button className="bg-[#524bb1] hover:bg-[#6962cc]" onClick={handleCreateCreditAccount}>
          Create
        </Button>
      </Container>
      <Container>
        <h4 className="text-xl mb-5">Get all Credit Accounts</h4>
        <Button className="bg-[#524bb1] hover:bg-[#6962cc]" onClick={handleGetCreditAccounts}>
          Fetch
        </Button>
      </Container>
      <Container>
        <h4 className="text-xl mb-5">Borrow OSMO</h4>
        <input
          className="rounded-lg px-3 py-1 bg-black/40"
          type="number"
          onChange={(e) => setBorrowAmount(e.target.valueAsNumber)}
        />
        <Button className="bg-[#524bb1] hover:bg-[#6962cc] ml-4" onClick={handleBorrowClick}>
          Borrow
        </Button>
      </Container>

      <div>
        {allTokens && (
          <div className="mb-4">
            <div className="flex items-end">
              <h5 className="text-xl font-medium">All Tokens</h5>
              <p className="text-sm ml-2">- {allTokens.length} total</p>
            </div>
            {allTokens.map((token) => (
              <p key={token}>{token}</p>
            ))}
          </div>
        )}
        {walletTokens && (
          <>
            <div className="flex items-end">
              <h5 className="text-xl font-medium">Your Tokens</h5>
              <p className="text-sm ml-2">- {walletTokens.length} total</p>
            </div>
            {walletTokens.map((token) => (
              <p key={token}>{token}</p>
            ))}
          </>
        )}
      </div>
      {error && <div className="bg-white p-4 text-red-500 mt-8">{error}</div>}
      {isLoading && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default Home
