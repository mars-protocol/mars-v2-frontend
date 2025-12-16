import { useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowUpLine, CoinsSwap } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositModal from 'hooks/common/useDepositModal'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
import useCurrentAccountDeposits from 'hooks/wallet/useCurrentAccountDeposits'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { isDepositOnlyAsset } from 'utils/assets'
import { BN } from 'utils/helpers'

export const LEND_BUTTON_META = {
  accessorKey: 'lend',
  enableSorting: false,
  header: '',
  meta: {
    className: 'w-35',
  },
}

interface Props {
  data: LendingMarketTableData
}
export default function LendButton(props: Props) {
  const { openLend } = useLendAndReclaimModal()
  const { openDeposit, openDepositAndLend } = useDepositModal()
  const accountDeposits = useCurrentAccountDeposits()
  const currentAccount = useCurrentAccount()
  const walletBalance = useCurrentWalletBalance(props.data.asset.denom)
  const assetDepositAmount = accountDeposits.find(byDenom(props.data.asset.denom))?.amount
  const address = useStore((s) => s.address)
  const hasWalletBalance = walletBalance && BN(walletBalance.amount).isGreaterThan(0)
  const isDefaultAccount = currentAccount?.kind === 'default'
  const isLendEnabled = !!props.data.asset.isAutoLendEnabled
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const isDepositOnly = isDepositOnlyAsset(props.data.asset)

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <ArrowUpLine />,
        text: 'Deposit',
        onClick: () => {
          openDeposit(props.data)
        },
      },
      ...(isLendEnabled
        ? [
            {
              icon: <CoinsSwap />,
              text: 'Deposit & Lend',
              onClick: () => {
                openDepositAndLend(props.data)
              },
            },
          ]
        : []),
      ...(isLendEnabled && assetDepositAmount
        ? [
            {
              icon: <ArrowUpLine />,
              text: 'Lend',
              onClick: () => openLend(props.data),
            },
          ]
        : []),
    ],
    [assetDepositAmount, isLendEnabled, openLend, openDeposit, openDepositAndLend, props.data],
  )

  // If user has wallet balance and it's a default account, show Manage dropdown
  if (hasWalletBalance && address && isDefaultAccount) {
    return (
      <div className='flex justify-end'>
        <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
      </div>
    )
  }

  // For LSTs, show Deposit button only
  if (isDepositOnly) {
    return (
      <div className='flex justify-end'>
        <ConditionalWrapper
          condition={!hasWalletBalance && !!address}
          wrapper={(children) => (
            <Tooltip
              type='warning'
              content={
                <Text size='sm'>{`You don't have any ${props.data.asset.symbol} in your wallet.`}</Text>
              }
              contentClassName='max-w-[200px]'
              className='ml-auto'
            >
              {children}
            </Tooltip>
          )}
        >
          <ActionButton
            leftIcon={<ArrowUpLine />}
            disabled={!hasWalletBalance}
            color='tertiary'
            onClick={(e) => {
              openDeposit(props.data)
              e.stopPropagation()
            }}
            text='Deposit'
            short
          />
        </ConditionalWrapper>
      </div>
    )
  }

  // If asset doesn't support lending, don't show anything
  if (!isLendEnabled) return null

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={!hasWalletBalance && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don't have any ${props.data.asset.symbol} in your wallet.`}</Text>
            }
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        {isAutoLendEnabledForCurrentAccount ? (
          <ActionButton
            leftIcon={<ArrowUpLine />}
            disabled={!hasWalletBalance}
            color='tertiary'
            onClick={(e) => {
              openLend(props.data)
              e.stopPropagation()
            }}
            text='Lend'
            short
          />
        ) : (
          <ActionButton
            leftIcon={<ArrowUpLine />}
            disabled={!hasWalletBalance}
            color='tertiary'
            onClick={(e) => {
              openDeposit(props.data)
              e.stopPropagation()
            }}
            text='Deposit'
            short
          />
        )}
      </ConditionalWrapper>
    </div>
  )
}
