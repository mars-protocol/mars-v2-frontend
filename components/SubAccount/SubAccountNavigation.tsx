import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { UseMutateFunction } from '@tanstack/react-query'
import classNames from 'classnames'
import Button from 'components/Button'
import ArrowDown from 'components/Icons/arrow-down.svg'
import ArrowUp from 'components/Icons/arrow-up.svg'
import ChevronDownIcon from 'components/Icons/expand.svg'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import { useMemo, useState } from 'react'

interface Props {
  creditAccountsList: string[]
  selectedAccount: string | null
  deleteCreditAccount: UseMutateFunction<ExecuteResult | undefined, Error, void, unknown>
  setSelectedAccount: (id: string) => void
  createCreditAccount: () => void
}

const MAX_VISIBLE_CREDIT_ACCOUNTS = 2

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

  return (
    <>
      {firstCreditAccounts.map((account) => (
        <Text
          key={account}
          className={classNames(
            'cursor-pointer px-4 hover:text-white',
            selectedAccount === account ? 'text-white' : ' text-white/40',
          )}
          onClick={() => setSelectedAccount(account)}
        >
          Account {account}
        </Text>
      ))}
      <div className='relative'>
        {restCreditAccounts.length > 0 && (
          <>
            <Text
              className='flex items-center px-3 py-3 hover:text-white'
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              role='button'
            >
              More
              <span className='ml-1 inline-block w-3'>
                <ChevronDownIcon />
              </span>
            </Text>
            <Overlay show={showMoreMenu} setShow={setShowMoreMenu}>
              <div className='flex w-[120px] flex-wrap p-4'>
                {restCreditAccounts.map((account) => (
                  <Text
                    key={account}
                    size='sm'
                    className={classNames(
                      'w-full whitespace-nowrap py-2 ',
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
                  </Text>
                ))}
              </div>
            </Overlay>
          </>
        )}
      </div>
      <div className='relative'>
        <Text
          className='flex items-center px-3 py-3 text-white/40 hover:text-white'
          onClick={() => setShowManageMenu(!showManageMenu)}
          role='button'
        >
          Manage
          <span className='ml-1 inline-block w-3'>
            <ChevronDownIcon />
          </span>
        </Text>
        <Overlay className='-left-[86px]' show={showManageMenu} setShow={setShowManageMenu}>
          <div className='flex w-[274px] flex-wrap'>
            <Text
              size='sm'
              uppercase={true}
              className='w-full px-4 pt-4 text-center text-accent-dark'
            >
              Manage
            </Text>
            <div className='flex w-full justify-between border border-transparent border-b-black/10 p-4'>
              <Button
                className='flex w-[115px] items-center justify-center pl-0 pr-2'
                onClick={() => alert('TODO')}
              >
                <span className='mr-1 w-3'>
                  <ArrowUp />
                </span>
                Fund
              </Button>
              <Button
                className='flex w-[115px] items-center justify-center pl-0 pr-2'
                color='secondary'
                onClick={() => alert('TODO')}
              >
                <span className='mr-1 w-3'>
                  <ArrowDown />
                </span>
                Withdraw
              </Button>
            </div>
            <div className='flex w-full flex-wrap p-4'>
              <Text
                size='sm'
                className='w-full cursor-pointer whitespace-nowrap py-2  text-accent-dark hover:text-secondary'
                onClick={() => {
                  setShowManageMenu(!showManageMenu)
                  createCreditAccount()
                }}
              >
                Create Account
              </Text>
              <Text
                size='sm'
                className='w-full cursor-pointer whitespace-nowrap py-2  text-accent-dark hover:text-secondary'
                onClick={() => {
                  setShowManageMenu(!showManageMenu)
                  deleteCreditAccount()
                }}
              >
                Close Account
              </Text>
              <Text
                size='sm'
                className='w-full cursor-pointer whitespace-nowrap py-2  text-accent-dark hover:text-secondary'
                onClick={() => alert('TODO')}
              >
                Transfer Balance
              </Text>
              <Text
                size='sm'
                className='w-full cursor-pointer whitespace-nowrap py-2  text-accent-dark hover:text-secondary'
                onClick={() => alert('TODO')}
              >
                Rearrange
              </Text>
            </div>
          </div>
        </Overlay>
      </div>
    </>
  )
}

export default SubAccountNavigation
