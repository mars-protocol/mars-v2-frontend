import classNames from 'classnames'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AccountStats from 'components/Account/AccountStats'
import { Button } from 'components/Button'
import Card from 'components/Card'
import { ArrowCircledTopRight, ArrowDownLine, ArrowUpLine, TrashBin } from 'components/Icons'
import Radio from 'components/Radio'
import SwitchWithLabel from 'components/SwitchWithLabel'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { calculateAccountDeposits } from 'utils/accounts'
import { hardcodedFee } from 'utils/contants'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'
import usePrices from 'hooks/usePrices'

interface Props {
  setShowFundAccount: (showFundAccount: boolean) => void
  accounts: Account[]
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20',
)

export default function AccountList(props: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { accountId, address } = useParams()
  const { data: prices } = usePrices()

  const deleteAccount = useStore((s) => s.deleteAccount)

  const [isLending, setIsLending] = useToggle()
  const accountSelected = !!accountId && !isNaN(Number(accountId))
  const selectedAccountDetails = props.accounts.find((account) => account.id === accountId)
  const selectedAccountBalance = selectedAccountDetails
    ? calculateAccountDeposits(selectedAccountDetails, prices)
    : BN(0)

  async function deleteAccountHandler() {
    if (!accountSelected) return
    const isSuccess = await deleteAccount({ fee: hardcodedFee, accountId: accountId })
    if (isSuccess) {
      navigate(`/wallets/${address}/accounts`)
    }
  }

  function onChangeLendSwitch() {
    setIsLending(!isLending)
    /* TODO: handle lending assets */
  }

  useEffect(() => {
    const element = document.getElementById(`account-${accountId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [accountId])

  if (!props.accounts?.length) return null

  return (
    <div className='flex w-full flex-wrap p-4'>
      {props.accounts.map((account) => {
        const positionBalance = calculateAccountDeposits(account, prices)
        const isActive = accountId === account.id
        return (
          <div key={account.id} id={`account-${account.id}`} className='w-full pt-4'>
            <Card
              id={`account-${account.id}`}
              key={account.id}
              className='w-full'
              contentClassName='bg-white/10'
              title={
                <div
                  className={classNames(
                    accountCardHeaderClasses,
                    !isActive && 'group hover:cursor-pointer',
                  )}
                  role={!isActive ? 'button' : undefined}
                  onClick={() => {
                    if (isActive) return
                    navigate(getRoute(getPage(pathname), address, account.id))
                  }}
                >
                  <Text size='xs' className='flex flex-1'>
                    Credit Account {account.id}
                  </Text>
                  <Radio active={isActive} className='group-hover:opacity-100' />
                </div>
              }
            >
              {isActive ? (
                <>
                  <div className='w-full border border-transparent border-b-white/20 p-4'>
                    <AccountStats balance={selectedAccountBalance} risk={75} health={85} />
                  </div>
                  <div className='grid grid-flow-row grid-cols-2 gap-4 p-4'>
                    <Button
                      className='w-full'
                      text='Fund'
                      color='tertiary'
                      leftIcon={<ArrowUpLine />}
                      onClick={() => {
                        useStore.setState({ fundAndWithdrawModal: 'fund' })
                      }}
                    />
                    <Button
                      className='w-full'
                      color='tertiary'
                      leftIcon={<ArrowDownLine />}
                      text='Withdraw'
                      onClick={() => {
                        useStore.setState({ fundAndWithdrawModal: 'withdraw' })
                      }}
                      disabled={positionBalance.isLessThanOrEqualTo(0)}
                    />
                    <Button
                      className='w-full'
                      color='tertiary'
                      leftIcon={<TrashBin />}
                      text='Delete'
                      onClick={() => deleteAccountHandler()}
                    />
                    <Button
                      className='w-full'
                      color='tertiary'
                      leftIcon={<ArrowCircledTopRight />}
                      text='Transfer'
                      onClick={() => {}}
                    />
                    <div className='col-span-2 border border-transparent border-t-white/10 pt-4'>
                      <SwitchWithLabel
                        name='isLending'
                        label='Lend assets to earn yield'
                        value={isLending}
                        onChange={onChangeLendSwitch}
                        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='w-full p-4'>
                  <AccountStats balance={positionBalance} risk={60} health={50} />
                </div>
              )}
            </Card>
          </div>
        )
      })}
    </div>
  )
}
