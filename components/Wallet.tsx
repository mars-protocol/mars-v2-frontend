import React, { useEffect, useState } from "react";
import { Popover } from "@headlessui/react";
import { toast } from "react-toastify";
import Image from "next/image";

import Button from "./Button";
import ConnectModal from "./ConnectModal";
import useWalletStore from "stores/useWalletStore";
import useTokenBalance from "hooks/useTokenBalance";
import { formatWalletAddress } from "utils/formatters";
import { chain } from "utils/chains";

const WalletPopover = ({ children }: { children: React.ReactNode }) => {
  const address = useWalletStore((state) => state.address);
  const actions = useWalletStore((state) => state.actions);

  const { data } = useTokenBalance();

  return (
    <Popover className="relative">
      <Popover.Button as={Button} className="w-[200px]">
        {children}
      </Popover.Button>

      <Popover.Panel className="absolute z-10 right-0 pt-2">
        <div className="bg-white rounded-2xl p-6 text-gray-900">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Image
                src={chain.stakeCurrency.coinImageUrl}
                alt="token"
                width={24}
                height={24}
              />
              <p className="ml-2">
                {chain.stakeCurrency.coinDenom}{" "}
                <span className="text-lg font-semibold ml-1">
                  {data?.toFixed(2)}
                </span>
              </p>
            </div>
            <Button
              className=" bg-[#524bb1] hover:bg-[#6962cc]"
              onClick={() => actions.setAddress("")}
            >
              Disconnect
            </Button>
          </div>
          <p className="mb-6 text-sm">{address}</p>
          <button
            className="flex items-center text-slate-500 hover:text-slate-700 text-sm"
            onClick={() => {
              navigator.clipboard.writeText(address).then(() => {
                toast.success("Address copied to your clipboard");
              });
            }}
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
              />
            </svg>
            Copy Address
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

const Wallet = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  const address = useWalletStore((state) => state.address);

  // avoid server-client hydration mismatch
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return (
    <>
      {hasHydrated && address ? (
        <WalletPopover>{formatWalletAddress(address)}</WalletPopover>
      ) : (
        <Button className="w-[200px]" onClick={() => setShowConnectModal(true)}>
          Connect Wallet
        </Button>
      )}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </>
  );
};

export default Wallet;
