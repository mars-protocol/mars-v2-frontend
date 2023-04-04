'use client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import AccountStats from 'components/Account/AccountStats'
import { Button } from 'components/Button'
import Card from 'components/Card'
import { ArrowCircledTopRight, ArrowDownLine, ArrowUpLine, TrashBin } from 'components/Icons'
import Radio from 'components/Radio'
import SwitchWithLabel from 'components/SwitchWithLabel'
import { Text } from 'components/Text'
import { ASSETS } from 'constants/assets'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { calculateAccountBalance } from 'utils/accounts'
import { hardcodedFee } from 'utils/contants'
import { formatValue } from 'utils/formatters'

interface Props {
  setShowFundAccount: (showFundAccount: boolean) => void
  accounts: Account[]
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20 ',
)

const formatOptions = {
  decimals: ASSETS[0].decimals,
  minDecimals: 0,
  maxDecimals: ASSETS[0].decimals,
  suffix: ` ${ASSETS[0].symbol}`,
}

export default function AccountList(props: Props) {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.accountId
  const prices = useStore((s) => s.prices)

  const deleteAccount = useStore((s) => s.deleteAccount)

  const [isLending, setIsLending] = useState(false)
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))
  const selectedAccountDetails = props.accounts.find((account) => account.id === selectedAccount)
  const selectedAccountBalance = selectedAccountDetails
    ? calculateAccountBalance(selectedAccountDetails, prices)
    : 0

  async function deleteAccountHandler() {
    if (!accountSelected) return
    const isSuccess = await deleteAccount({ fee: hardcodedFee, accountId: selectedAccount })
    if (isSuccess) {
      router.push(`/wallets/${params.address}/accounts`)
    }
  }

  function handleLendAssets(val: boolean) {
    setIsLending(val)
    /* TODO: handle lending assets */
  }

  if (!props.accounts?.length) return null

  useStore.setState({ accounts: props.accounts })

  return (
    <div className='flex w-full flex-wrap gap-4 p-4'>
      {selectedAccountDetails && (
        <Card
          className='w-full'
          contentClassName='bg-white/10'
          title={
            <div className={accountCardHeaderClasses}>
              <Text size='xs' className='flex flex-1'>
                Credit Account #{selectedAccountDetails.id}
              </Text>
              <Radio active={true} />
            </div>
          }
        >
          <div className='w-full border border-transparent border-b-white/20 p-4'>
            <AccountStats
              balance={formatValue(selectedAccountBalance, formatOptions)}
              risk={75}
              health={0.85}
            />
          </div>
          <div className='grid grid-flow-row grid-cols-2 gap-4 p-4'>
            <Button
              className='w-full'
              text='Fund'
              color='tertiary'
              leftIcon={<ArrowUpLine />}
              onClick={() => props.setShowFundAccount(true)}
            />
            <Button
              className='w-full'
              color='tertiary'
              leftIcon={<ArrowDownLine />}
              text='Withdraw'
              onClick={() => {
                useStore.setState({ withdrawModal: true })
              }}
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
                onChange={handleLendAssets}
                tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
              />
            </div>
          </div>
        </Card>
      )}
      {props.accounts.map((account) => {
        const positionBalance = calculateAccountBalance(account, prices)
        return selectedAccount === account.id ? null : (
          <Card
            key={account.id}
            className='w-full'
            contentClassName='bg-white/10'
            title={
              <div className={accountCardHeaderClasses}>
                <Text size='xs' className='flex flex-1'>
                  Credit Account #{account.id}
                </Text>
                <Button
                  variant='transparent'
                  color='quaternary'
                  onClick={() => {
                    router.push(`/wallets/${params.address}/accounts/${account.id}`)
                  }}
                  text={<Radio />}
                />
              </div>
            }
          >
            <div className='w-full p-4'>
              <AccountStats
                balance={formatValue(positionBalance, formatOptions)}
                risk={60}
                health={0.5}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
