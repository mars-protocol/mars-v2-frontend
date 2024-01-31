import { useCallback } from 'react'

import { ACCOUNT_MENU_BUTTON_ID } from 'components/account/AccountMenuContent'
import Button from 'components/common/Button'
import ActionButton from 'components/common/Button/ActionButton'
import { ArrowDownLine, ArrowUpLine, Enter, ExclamationMarkCircled } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useAccountId from 'hooks/useAccountId'
import useAlertDialog from 'hooks/useAlertDialog'
import useAutoLend from 'hooks/useAutoLend'
import useCurrentAccountDeposits from 'hooks/useCurrentAccountDeposits'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  data: LendingMarketTableData
}

const buttonClassnames = 'm-0 flex w-40'
const iconClassnames = 'ml-0 mr-1 w-4 h-4'

export default function LendingActionButtons(props: Props) {
  const { asset, accountLentValue: accountLendValue } = props.data
  const accountDeposits = useCurrentAccountDeposits()
  const { openLend, openReclaim } = useLendAndReclaimModal()
  const { open: showAlertDialog } = useAlertDialog()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const assetDepositAmount = accountDeposits.find(byDenom(asset.denom))?.amount
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const hasNoDeposit = !!(!assetDepositAmount && address && accountId)

  const handleUnlend = useCallback(() => {
    if (isAutoLendEnabledForCurrentAccount) {
      showAlertDialog({
        icon: <ExclamationMarkCircled width={18} />,
        title: 'Disable Automatically Lend Assets',
        content:
          "Your auto-lend feature is currently enabled. To unlend your funds, please confirm if you'd like to disable this feature in order to continue.",
        positiveButton: {
          onClick: () => document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click(),
          text: 'Continue to Account Settings',
          icon: <Enter />,
        },
        negativeButton: {
          text: 'Cancel',
        },
      })

      return
    }

    openReclaim(props.data)
  }, [isAutoLendEnabledForCurrentAccount, openReclaim, props.data, showAlertDialog])

  return (
    <div className='flex flex-row space-x-2'>
      {accountLendValue && accountLendValue.isGreaterThan(0) && (
        <Button
          leftIcon={<ArrowDownLine />}
          iconClassName={iconClassnames}
          color='secondary'
          onClick={handleUnlend}
          className={buttonClassnames}
        >
          Unlend
        </Button>
      )}

      <ConditionalWrapper
        condition={hasNoDeposit}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don’t have any ${asset.symbol}. Please first deposit ${asset.symbol} into your Credit Account before lending.`}</Text>
            }
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<ArrowUpLine />}
          iconClassName={iconClassnames}
          disabled={hasNoDeposit}
          color='secondary'
          onClick={() => openLend(props.data)}
          className={buttonClassnames}
          text='Lend'
        />
      </ConditionalWrapper>
    </div>
  )
}
