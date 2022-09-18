import React, { useState } from "react";
import type { NextPage } from "next";
// import Head from "next/head";
// import Image from "next/image";
// import styles from "../styles/Home.module.css";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
// import { Coin } from "@cosmjs/stargate";

import Container from "components/Container";
import Button from "components/Button";
import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import BigNumber from "bignumber.js";

// https://github.com/mars-protocol/rover/blob/master/scripts/deploy/addresses/osmo-test-4.json

const contractAddresses = {
  accountNft: "osmo1zwxt98d4w6dc7nwgh5znmqf2kglyax4gg9hr3497lmfywfcckppsgw3hkx",
  mockRedBank:
    "osmo1zqsgw96drq3cav4kwfecfy26zyl0wt6zpkh9xwfj08smt6acq45skrakkp",
  mockOracle: "osmo1dqfzp4vqyfcz0f6yuajvky9gwaxnpw2kmh447z0wy37k40hl8g8sdwq9qp",
  mockVault: "osmo1m7cx2r6czyqmqc7nt8zhlk8y63ewk23wfg3tvng9askeztzt7f7qq294hz",
  swapper: "osmo1dkg8rkhgtvav3aufth6ud49pz5ces6vqg5vwdgthlhgtutq74q8qrrt2wd",
  creditManager:
    "osmo1zf26ahe5gqjtvnedh7ems7naf2wtw3z4ll6atf3t0hptal8ss4vq2mlx6w",
};

const Home: NextPage = () => {
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const [allTokens, setAllTokens] = useState<string[] | null>(null);
  const [walletTokens, setWalletTokens] = useState<string[] | null>(null);

  const address = useWalletStore((state) => state.address);

  // StdFee
  const hardcodedFee = {
    amount: [
      {
        denom: chain.stakeCurrency.coinMinimalDenom,
        amount: "100000",
      },
    ],
    gas: "150000",
  };

  const handleSendClick = async () => {
    if (!window.keplr) return;

    try {
      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        chain.rpc,
        offlineSigner
      );

      // console.log(await signingClient.getHeight());

      // console.log(
      //   "contract info",
      //   signingClient.getContract(
      //     "osmo1zf26ahe5gqjtvnedh7ems7naf2wtw3z4ll6atf3t0hptal8ss4vq2mlx6w"
      //   )
      // );

      const res = await signingClient.sendTokens(
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
      );

      console.log("txResponse", res);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCreateCreditAccount = async () => {
    if (!window.keplr) return;

    try {
      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        chain.rpc,
        offlineSigner
      );

      const executeMsg = {
        mint: {
          user: address,
        },
      };

      const mintResult = await signingClient.execute(
        address,
        contractAddresses.accountNft,
        executeMsg,
        hardcodedFee
        // undefined,
        // [
        //   {
        //     denom: "uosmo",
        //     amount: "10000",
        //   },
        // ]
      );
      console.log("mint result", mintResult);
    } catch (e) {
      console.log(e);
    }
  };

  // https://github.com/mars-protocol/rover/blob/master/scripts/types/generated/account-nft/AccountNft.types.ts
  const handleGetCreditAccounts = async () => {
    if (!window.keplr) return;

    try {
      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        chain.rpc,
        offlineSigner
      );

      const allTokensQueryMsg = {
        all_tokens: {},
      };

      const allTokensResponse = await signingClient.queryContractSmart(
        contractAddresses.accountNft,
        allTokensQueryMsg
      );

      setAllTokens(allTokensResponse.tokens);

      console.log("all tokens", allTokensResponse);

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
      };

      const tokensResponse = await signingClient.queryContractSmart(
        contractAddresses.accountNft,
        tokensQueryMsg
      );

      console.log("res tokens", tokensResponse);
      setWalletTokens(tokensResponse.tokens);
    } catch (e) {
      console.log(e);
    }
  };

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
        <Button
          className="bg-[#524bb1] hover:bg-[#6962cc]"
          onClick={handleSendClick}
        >
          Send
        </Button>
      </Container>
      <Container>
        <h4 className="text-xl mb-5">Create Credit Account (Mint NFT)</h4>
        <Button
          className="bg-[#524bb1] hover:bg-[#6962cc]"
          onClick={handleCreateCreditAccount}
        >
          Create
        </Button>
      </Container>
      <Container>
        <h4 className="text-xl mb-5">Get all Credit Accounts</h4>
        <Button
          className="bg-[#524bb1] hover:bg-[#6962cc]"
          onClick={handleGetCreditAccounts}
        >
          Fetch
        </Button>
      </Container>
      <div>
        {allTokens && (
          <div className="mb-4">
            <h5>All Tokens:</h5>
            <p>Total: {allTokens.length}</p>
            {allTokens.map((token) => (
              <p key={token}>{token}</p>
            ))}
          </div>
        )}
        {walletTokens && (
          <>
            <h5>Your Tokens:</h5>
            <p>Total: {walletTokens.length}</p>
            {walletTokens.map((token) => (
              <p key={token}>{token}</p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
