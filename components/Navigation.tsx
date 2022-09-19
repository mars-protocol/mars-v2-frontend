import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

import SearchInput from "components/SearchInput";
import ProgressBar from "components/ProgressBar";
import Spinner from "components/Spinner";
import Wallet from "components/Wallet";
import { formatCurrency } from "utils/formatters";
import useCreditAccounts from "hooks/useCreditAccounts";
import useCreateCreditAccount from "hooks/useCreateCreditAccount";
import useDeleteCreditAccount from "hooks/useDeleteCreditAccount";
import useCreditManagerStore from "stores/useCreditManagerStore";

const NavLink = ({ href, children }: { href: string; children: string }) => {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        className={`${
          router.pathname === href ? "text-white" : ""
        } hover:text-white`}
      >
        {children}
      </a>
    </Link>
  );
};

const Navigation = () => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount);
  const setSelectedAccount = useCreditManagerStore(
    (s) => s.actions.setSelectedAccount
  );

  const { data: creditAccountsList } = useCreditAccounts();
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } =
    useCreateCreditAccount();
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } =
    useDeleteCreditAccount(selectedAccount || "");

  // split credit accounts array in 2 (one with first five, other with the rest of the elements)
  const { firstCreditAccounts, otherCreditAccounts } = useMemo(() => {
    if (!creditAccountsList) {
      return {
        firstCreditAccounts: [],
        otherCreditAccounts: [],
      };
    }

    const [first, second, third, forth, fifth, ...rest] = creditAccountsList;

    return {
      firstCreditAccounts: [first, second, third, forth, fifth],
      otherCreditAccounts: rest,
    };
  }, [creditAccountsList]);

  return (
    <div>
      {/* Main navigation bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-white/20">
        <Link href="/" passHref>
          <a>
            <img src="/logo.svg" alt="mars" />
          </a>
        </Link>
        <div className="flex px-12 gap-5 text-white/40">
          <NavLink href="/trade">Trade</NavLink>
          <NavLink href="/yield">Yield</NavLink>
          <NavLink href="/borrow">Borrow</NavLink>
          <NavLink href="/portfolio">Portfolio</NavLink>
          <NavLink href="/council">Council</NavLink>
        </div>
        <Wallet />
      </div>
      {/* Sub navigation bar */}
      <div className="flex justify-between px-6 py-3 text-sm text-white/40 border-b border-white/20">
        <div className="flex items-center">
          <SearchInput />
          {firstCreditAccounts.map((account) => (
            <div
              key={account}
              className={`px-4 hover:text-white cursor-pointer ${
                selectedAccount === account ? "text-white" : ""
              }`}
              onClick={() => setSelectedAccount(account)}
            >
              Account {account}
            </div>
          ))}
          {otherCreditAccounts.length > 0 && (
            <Popover className="relative">
              <Popover.Button>
                <div className="px-3 flex items-center hover:text-white cursor-pointer">
                  More
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </div>
              </Popover.Button>
              <Popover.Panel className="absolute z-10 pt-2 w-[200px]">
                {({ close }) => (
                  <div className="bg-white rounded-2xl p-4 text-gray-900">
                    {otherCreditAccounts.map((account) => (
                      <div
                        key={account}
                        className={`cursor-pointer hover:text-orange-500 ${
                          selectedAccount === account ? "text-orange-500" : ""
                        }`}
                        onClick={() => setSelectedAccount(account)}
                      >
                        Account {account}
                      </div>
                    ))}
                  </div>
                )}
              </Popover.Panel>
            </Popover>
          )}
          <Popover className="relative">
            <Popover.Button>
              <div className="px-3 flex items-center hover:text-white cursor-pointer">
                Manage
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </div>
            </Popover.Button>
            <Popover.Panel className="absolute z-10 pt-2 w-[200px]">
              {({ close }) => (
                <div className="bg-white rounded-2xl p-4 text-gray-900">
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => {
                      close();
                      createCreditAccount();
                    }}
                  >
                    Create Account
                  </div>
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => {
                      close();
                      deleteCreditAccount();
                    }}
                  >
                    Close Account
                  </div>
                  <div
                    className="mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => alert("TODO")}
                  >
                    Transfer Balance
                  </div>
                  <div
                    className="cursor-pointer hover:text-orange-500"
                    onClick={() => alert("TODO")}
                  >
                    Rearrange
                  </div>
                </div>
              )}
            </Popover.Panel>
          </Popover>
        </div>
        <div className="flex gap-4 items-center">
          <p>$: ${formatCurrency(2500)}</p>
          <div>Lvg</div>
          <div>Risk</div>
          <ProgressBar value={0.43} />
          <div className="flex justify-center w-16">
            <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor">
              <path d="M0.234863 6.57567C0.234863 7.07288 0.581403 7.41188 1.08615 7.41188H8.04708L9.62912 7.33655L7.45194 9.31785L5.93771 10.8547C5.77951 11.0129 5.68157 11.2163 5.68157 11.4574C5.68157 11.9244 6.02811 12.2634 6.50272 12.2634C6.72872 12.2634 6.93213 12.173 7.12047 11.9922L11.859 7.20094C11.9871 7.07288 12.0775 6.92221 12.1152 6.74894V11.5478C12.1152 12.0148 12.4692 12.3538 12.9363 12.3538C13.4109 12.3538 13.765 12.0148 13.765 11.5478V1.6111C13.765 1.14403 13.4109 0.797485 12.9363 0.797485C12.4692 0.797485 12.1152 1.14403 12.1152 1.6111V6.39486C12.0775 6.22913 11.9871 6.07846 11.859 5.95039L7.12047 1.15156C6.93213 0.970755 6.72872 0.880354 6.50272 0.880354C6.02811 0.880354 5.68157 1.22689 5.68157 1.68644C5.68157 1.92751 5.77951 2.13845 5.93771 2.28911L7.45194 3.83348L9.62912 5.80725L8.04708 5.73192H1.08615C0.581403 5.73192 0.234863 6.07846 0.234863 6.57567Z" />
            </svg>
          </div>
        </div>
      </div>
      {(isLoadingCreate || isLoadingDelete) && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Navigation;
