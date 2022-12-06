import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { UseMutateFunction } from '@tanstack/react-query'
import classNames from 'classnames'
import { useMemo, useState } from 'react'

import { FundAccountModal, WithdrawModal } from 'components/Account'
import Button from 'components/Button'
import ArrowDown from 'components/Icons/arrow-down.svg'
import ArrowUp from 'components/Icons/arrow-up.svg'
import ChevronDownIcon from 'components/Icons/expand.svg'
import Overlay from 'components/Overlay'
import Text from 'components/Text'

interface Props {
  creditAccountsList: string[]
  selectedAccount: string | null
  deleteCreditAccount: UseMutateFunction<ExecuteResult | undefined, Error, void, unknown>
  setSelectedAccount: (id: string) => void
  createCreditAccount: () => void
}

const MAX_VISIBLE_CREDIT_ACCOUNTS = 5

const SubAccountNavigation = ({
  creditAccountsList,
  createCreditAccount,
  deleteCreditAccount,
  selectedAccount,
  setSelectedAccount,
}: Props) => {
  const { firstCreditAccounts, restCreditAccounts } = useMemo(() => {
    return {
      firstCreditAccounts: creditAccountsList?.slice(0, MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
      restCreditAccounts: creditAccountsList?.slice(MAX_VISIBLE_CREDIT_ACCOUNTS) ?? [],
    }
  }, [creditAccountsList])

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showFundWalletModal, setShowFundWalletModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  return (
    <>
      {firstCreditAccounts.map((account) => (
        <Button
          key={account}
          className={classNames(
            'cursor-pointer whitespace-nowrap px-4 text-base hover:text-white',
            selectedAccount === account ? 'text-white' : ' text-white/40',
          )}
          variant='text'
          onClick={() => setSelectedAccount(account)}
        >
          Account {account}
        </Button>
      ))}
      <div className='relative'>
        {restCreditAccounts.length > 0 && (
          <>
            <Button
              className='flex items-center px-3 py-3 text-base hover:text-white'
              variant='text'
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              More
              <span className='ml-1 inline-block w-3'>
                <ChevronDownIcon />
              </span>
            </Button>
            <Overlay show={showMoreMenu} setShow={setShowMoreMenu}>
              <div className='flex w-[120px] flex-wrap p-4'>
                {restCreditAccounts.map((account) => (
                  <Button
                    key={account}
                    variant='text'
                    className={classNames(
                      'w-full whitespace-nowrap py-2 text-sm',
                      selectedAccount === account
                        ? 'text-secondary'
                        : 'cursor-pointer text-accent-dark hover:text-secondary',
                    )}
                    onClick={() => {
                      setShowMoreMenu(!showMoreMenu)
                      setSelectedAccount(account)
                    }}
                  >
                    Account {account}
                  </Button>
                ))}
              </div>
            </Overlay>
          </>
        )}
      </div>
      <div className='relative'>
        <Button
          className={classNames(
            'flex items-center px-3 py-3 text-base hover:text-white',
            showManageMenu ? 'text-white' : 'text-white/40',
          )}
          onClick={() => setShowManageMenu(!showManageMenu)}
          variant='text'
        >
          Manage
          <span className='ml-1 inline-block w-3'>
            <ChevronDownIcon />
          </span>
        </Button>
        <Overlay className='-left-[86px]' show={showManageMenu} setShow={setShowManageMenu}>
          <div className='flex w-[274px] flex-wrap'>
            <Text
              size='sm'
              uppercase={true}
              className='w-full px-4 pt-4 text-center text-accent-dark'
            >
              Manage
            </Text>
            <div className='flex w-full justify-between border-b border-b-black/10 p-4'>
              <Button
                className='flex w-[115px] items-center justify-center pl-0 pr-2'
                onClick={() => {
                  setShowFundWalletModal(true)
                  setShowManageMenu(!showManageMenu)
                }}
              >
                <span className='mr-1 w-3'>
                  <ArrowUp />
                </span>
                Fund
              </Button>
              <Button
                className='flex w-[115px] items-center justify-center pl-0 pr-2'
                color='secondary'
                onClick={() => {
                  setShowWithdrawModal(true)
                  setShowManageMenu(!showManageMenu)
                }}
              >
                <span className='mr-1 w-3'>
                  <ArrowDown />
                </span>
                Withdraw
              </Button>
            </div>
            <div className='flex w-full flex-wrap p-4'>
              <Button
                className='w-full cursor-pointer whitespace-nowrap py-2 text-left text-sm text-accent-dark hover:text-secondary'
                variant='text'
                onClick={() => {
                  setShowManageMenu(!showManageMenu)
                  createCreditAccount()
                }}
              >
                Create Account
              </Button>
              <Button
                className='w-full cursor-pointer whitespace-nowrap py-2 text-left text-sm text-accent-dark hover:text-secondary'
                variant='text'
                onClick={() => {
                  setShowManageMenu(!showManageMenu)
                  deleteCreditAccount()
                }}
              >
                Close Account
              </Button>
              <Button
                className='w-full cursor-pointer whitespace-nowrap py-2 text-left text-sm text-accent-dark hover:text-secondary'
                variant='text'
                onClick={() => alert('TODO')}
              >
                Transfer Balance
              </Button>
              <Button
                className='w-full cursor-pointer whitespace-nowrap py-2 text-left text-sm text-accent-dark hover:text-secondary'
                variant='text'
                onClick={() => alert('TODO')}
              >
                Rearrange
              </Button>
            </div>
          </div>
        </Overlay>
      </div>
      <FundAccountModal open={showFundWalletModal} setOpen={setShowFundWalletModal} />
      <WithdrawModal open={showWithdrawModal} setOpen={setShowWithdrawModal} />
    </>
  )
}

export default SubAccountNavigation
