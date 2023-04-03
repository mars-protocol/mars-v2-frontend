'use client'

import { useRouter } from 'next/navigation'
import classNames from 'classnames'
import { useState } from 'react'

import { Button } from 'components/Button'
import Card from 'components/Card'
import { ArrowCircledTopRight, ArrowDownLine, ArrowUpLine, TrashBin } from 'components/Icons'
import Radio from 'components/Radio'
import SwitchWithLabel from 'components/SwitchWithLabel'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

import AccountStats from './AccountStats'

interface Props {
  setShowFundAccount: (showFundAccount: boolean) => void
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20 ',
)

export default function AccountList(props: Props) {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account
  const creditAccounts = useStore((s) => s.creditAccounts)

  const deleteCreditAccount = useStore((s) => s.deleteCreditAccount)

  const [lendAssets, setLendAssets] = useState(false)
  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  async function deleteAccountHandler() {
    if (!accountSelected) return
    const isSuccess = await deleteCreditAccount({ fee: hardcodedFee, accountId: selectedAccount })
    if (isSuccess) {
      router.push(`/wallets/${params.wallet}/accounts`)
    }
  }

  function handleLendAssets(val: boolean) {
    setLendAssets(val)
  }
  return !creditAccounts ? null : (
    <div className='flex w-full flex-wrap gap-4 p-4'>
      {accountSelected && (
        <Card
          className='w-full'
          contentClassName='bg-white/10'
          title={
            <div className={accountCardHeaderClasses}>
              <Text size='xs' className='flex flex-1'>
                Credit Account #{selectedAccount}
              </Text>
              <Radio active={true} />
            </div>
          }
        >
          <div className='w-full border border-transparent border-b-white/20 p-4'>
            <AccountStats balance='$ 26,000.55' risk={75} health={0.85} />
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
                name='lendAssets'
                label='Lend assets to earn yield'
                value={lendAssets}
                changeHandler={handleLendAssets}
                tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
              />
            </div>
          </div>
        </Card>
      )}
      {creditAccounts.map((account) => {
        return selectedAccount === account ? null : (
          <Card
            key={account}
            className='w-full'
            contentClassName='bg-white/10'
            title={
              <div className={accountCardHeaderClasses}>
                <Text size='xs' className='flex flex-1'>
                  Credit Account #{account}
                </Text>
                <Button
                  variant='transparent'
                  color='quaternary'
                  onClick={() => {
                    router.push(`/wallets/${params.wallet}/accounts/${account}`)
                  }}
                  text={<Radio />}
                />
              </div>
            }
          >
            <div className='w-full p-4'>
              <AccountStats balance='$ 26,000.55' risk={60} health={0.5} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
