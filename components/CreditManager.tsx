import React, { useEffect, useMemo, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import BigNumber from "bignumber.js";

import Button from "./Button";
import { formatCurrency } from "utils/formatters";
import useAllowedCoins from "hooks/useAllowedCoins";
import useDepositCreditAccount from "hooks/useDepositCreditAccount";
import useCreditManagerStore from "stores/useCreditManagerStore";
import useAllBalances from "hooks/useAllBalances";
import useWalletStore from "stores/useWalletStore";
import useCreditAccountBalances from "hooks/useCreditAccountPositions";
import { getTokenDecimals, getTokenSymbol } from "utils/tokens";
import usePriceOracle from "hooks/usePriceOracle";

const FundAccountModule = () => {
  const [amount, setAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState("");

  const selectedAccount = useCreditManagerStore(
    (state) => state.selectedAccount
  );

  const { data: balancesData } = useAllBalances();
  const { data: allowedCoinsData, isLoading: isLoadingAllowedCoins } =
    useAllowedCoins();
  const { mutate } = useDepositCreditAccount(
    selectedAccount || "",
    selectedToken,
    BigNumber(amount)
      .times(10 ** getTokenDecimals(selectedToken))
      .toNumber()
  );

  useEffect(() => {
    if (allowedCoinsData && allowedCoinsData.length > 0) {
      // initialize selected token when allowedCoins fetch data is available
      setSelectedToken(allowedCoinsData[0]);
    }
  }, [allowedCoinsData]);

  const walletAmount = useMemo(() => {
    if (!selectedToken) return 0;

    return BigNumber(
      balancesData?.find((balance) => balance.denom === selectedToken)
        ?.amount ?? 0
    )
      .div(10 ** getTokenDecimals(selectedToken))
      .toNumber();
  }, [balancesData, selectedToken]);

  const handleValueChange = (value: number) => {
    if (value > walletAmount) {
      setAmount(walletAmount);
      return;
    }

    setAmount(value);
  };

  const maxValue = walletAmount;
  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / maxValue;

  return (
    <>
      <ContainerStyled className="p-3 mb-2">
        <p className="mb-6">
          Transfer assets from your injective wallet to your Mars credit
          account. If you don’t have any assets in your injective wallet use the
          injective bridge to transfer funds to your injective wallet.
        </p>
        {isLoadingAllowedCoins ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <div>Asset:</div>
                <select
                  className="bg-transparent"
                  onChange={(e) => {
                    setSelectedToken(e.target.value);

                    if (e.target.value !== selectedToken) setAmount(0);
                  }}
                >
                  {allowedCoinsData?.map((entry) => (
                    <option key={entry} value={entry}>
                      {getTokenSymbol(entry)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <div>Amount:</div>
                <input
                  type="number"
                  className="bg-transparent border border-black/50 px-2"
                  value={amount}
                  onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                />
              </div>
            </div>
            <p>In wallet: {walletAmount.toLocaleString()}</p>
            {/* SLIDER - initial implementation to test functionality */}
            {/* TODO: will need to be revamped later on */}
            <div className="relative flex flex-1 mb-6 items-center">
              <Slider.Root
                className="relative flex h-[20px] w-full cursor-pointer touch-none select-none items-center"
                value={[percentageValue]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => {
                  const decimal = value[0] / 100;
                  const tokenDecimals = getTokenDecimals(selectedToken);
                  // limit decimal precision based on token contract decimals
                  const newAmount = Number(
                    (decimal * maxValue).toFixed(tokenDecimals)
                  );

                  setAmount(newAmount);
                }}
              >
                <Slider.Track className="relative h-[6px] grow rounded-full bg-black/50">
                  <Slider.Range className="absolute h-[100%] rounded-full bg-orange-500" />
                </Slider.Track>
                <Slider.Thumb className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white !outline-none">
                  <div className="relative top-5 text-xs">
                    {percentageValue.toFixed(0)}%
                  </div>
                </Slider.Thumb>
              </Slider.Root>
              <button
                className="ml-4 py-1 px-2 text-sm bg-orange-500 text-white rounded-md"
                onClick={() => setAmount(maxValue)}
              >
                MAX
              </button>
            </div>
          </>
        )}
      </ContainerStyled>
      <ContainerStyled className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-bold">Lending Assets</h3>
          <div className="opacity-50">
            Lend assets from account to earn yield.
          </div>
        </div>

        <div>SWITCH</div>
      </ContainerStyled>
      <Button
        className="w-full !rounded-lg"
        onClick={() => mutate()}
        disabled={amount === 0 || !amount}
      >
        Fund
      </Button>
    </>
  );
};

const ContainerStyled = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`p-2 bg-[#D8DAEA] rounded-lg text-[#585A74] text-sm ${className}`}
    >
      {children}
    </div>
  );
};

const CreditManager = () => {
  const [isFund, setIsFund] = useState(false);

  const address = useWalletStore((state) => state.address);
  const selectedAccount = useCreditManagerStore(
    (state) => state.selectedAccount
  );

  const prices = usePriceOracle();
  console.log(prices);

  const { data: positionsData, isLoading: isLoadingPositions } =
    useCreditAccountBalances(selectedAccount ?? "");

  const totalPosition =
    positionsData?.coins.reduce((acc, coin) => {
      return Number(coin.value) + acc;
    }, 0) ?? 0;

  const totalDebt =
    positionsData?.debt.reduce((acc, coin) => {
      return Number(coin.value) + acc;
    }, 0) ?? 0;

  if (!address) {
    return (
      <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
        <ContainerStyled>You must have a connected wallet</ContainerStyled>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
      <ContainerStyled className="mb-2">
        {isFund ? (
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Fund Account</h3>
            <Button className="rounded-md" onClick={() => setIsFund(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              className="rounded-md flex-1"
              onClick={() => setIsFund(true)}
            >
              Fund
            </Button>
            <Button className="rounded-md flex-1" onClick={() => alert("TODO")}>
              Withdraw
            </Button>
          </div>
        )}
      </ContainerStyled>
      {isFund ? (
        <FundAccountModule />
      ) : (
        <>
          <ContainerStyled className="mb-2">
            <div className="flex justify-between">
              <div>Total Position:</div>
              <div className="font-semibold">
                {formatCurrency(totalPosition)}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Total Liabilities:</div>
              <div className="font-semibold">{formatCurrency(totalDebt)}</div>
            </div>
          </ContainerStyled>
          <ContainerStyled>
            <h4 className="font-bold">Balances</h4>
            {isLoadingPositions ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="flex font-semibold text-xs">
                  <div className="flex-1">Asset</div>
                  <div className="flex-1">Value</div>
                  <div className="flex-1">Size</div>
                  <div className="flex-1">APY</div>
                </div>
                {positionsData?.coins.map((coin) => (
                  <div key={coin.denom} className="flex text-xs text-black/40">
                    <div className="flex-1">{coin.denom}</div>
                    <div className="flex-1">{formatCurrency(coin.value)}</div>
                    <div className="flex-1">
                      {BigNumber(coin.amount)
                        .div(10 ** getTokenDecimals(coin.denom))
                        .toNumber()
                        .toLocaleString()}
                    </div>
                    <div className="flex-1">-</div>
                  </div>
                ))}
              </>
            )}
          </ContainerStyled>
        </>
      )}
    </div>
  );
};

export default CreditManager;
