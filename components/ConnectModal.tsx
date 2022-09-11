import React, { Fragment, useState } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";

import { getInjectiveAddress } from "utils/address";
import { useWallet } from "hooks/useWallet";
import { getExperimentalChainConfigBasedOnChainId } from "utils/experimental-chains";
import { ChainId } from "types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ConnectModal = ({ isOpen, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const { setAddress, isMetamaskAvailable } = useWallet();

  const handleConnectSuccess = () => {
    onClose();

    // defering update on loading state to avoid updating before close animation is finished
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleConnectKeplr = async () => {
    if (!window.keplr) {
      toast.error("Missing Keplr extension!");
      return;
    }

    setIsLoading(true);

    try {
      const chainData = getExperimentalChainConfigBasedOnChainId(
        ChainId.Mainnet
      );
      await window.keplr.experimentalSuggestChain(chainData);

      const key = await window.keplr.getKey(ChainId.Mainnet);
      setAddress(key.bech32Address);
      handleConnectSuccess();
    } catch (e) {
      // TODO: handle exception
      console.log(e);
      setIsLoading(false);
    }
  };

  const handleConnectMetamask = async () => {
    setIsLoading(true);

    try {
      // TODO: missing type definitions
      const addresses = await (window.ethereum as any).request({
        method: "eth_requestAccounts",
      });
      const [address] = addresses;
      setAddress(getInjectiveAddress(address));
      handleConnectSuccess();
    } catch (e) {
      // TODO: handle exception
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-6"
                >
                  Connect your wallet
                </Dialog.Title>
                {isLoading ? (
                  <div role="status" className="text-center">
                    <svg
                      className="inline w-10 h-10 text-gray-200 animate-spin fill-orange-500"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      className="flex items-center p-4 bg-[#524bb1] rounded-xl hover:bg-[#6962cc]"
                      onClick={handleConnectMetamask}
                    >
                      <Image
                        src="/wallets/metamask.webp"
                        height={30}
                        width={30}
                        alt="metamask"
                      />
                      <div className="ml-4 text-left">
                        <p>Metamask</p>
                        <p className="text-sm text-gray-400">
                          {isMetamaskAvailable
                            ? "Connect using Metamask"
                            : "Install extension"}
                        </p>
                      </div>
                    </button>
                    <button
                      className="flex items-center p-4 bg-[#524bb1] rounded-xl hover:bg-[#6962cc]"
                      onClick={handleConnectKeplr}
                    >
                      <Image
                        src="/wallets/keplr.png"
                        height={30}
                        width={30}
                        alt="keplr"
                      />
                      <div className="ml-4 text-left">
                        <p>Keplr</p>
                        <p className="text-sm text-gray-400">
                          Connect using Keplr
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConnectModal;
