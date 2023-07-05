import { useCallback } from 'react'

import Button from 'components/Button'
import { ArrowDownLine, ArrowUpLine, Enter } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useAlertDialog from 'hooks/useAlertDialog'
import useCurrentAccountDeposits from 'hooks/useCurrentAccountDeposits'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import { byDenom } from 'utils/array'
import useAutoLendEnabledAccountIds from 'hooks/useAutoLendEnabledAccountIds'
import { ACCOUNT_MENU_BUTTON_ID } from 'components/Account/AccountMenuContent'

interface Props {
  data: LendingMarketTableData
}

const buttonClassnames = 'm-0 flex w-40 text-lg'
const iconClassnames = 'ml-0 mr-1 w-4 h-4'

function LendingActionButtons(props: Props) {
  const { asset, accountLentValue: accountLendValue } = props.data
  const accountDeposits = useCurrentAccountDeposits()
  const { openLend, openReclaim } = useLendAndReclaimModal()
  const { open: showAlertDialog } = useAlertDialog()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLendEnabledAccountIds()
  const assetDepositAmount = accountDeposits.find(byDenom(asset.denom))?.amount

  const handleWithdraw = useCallback(() => {
    if (isAutoLendEnabledForCurrentAccount) {
      showAlertDialog({
        title: 'Disable Automatically Lend Assets',
        description:
          "Your auto-lend feature is currently enabled. To recover your funds, please confirm if you'd like to disable this feature in order to continue.",
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
      {accountLendValue && (
        <Button
          leftIcon={<ArrowDownLine />}
          iconClassName={iconClassnames}
          color='secondary'
          onClick={handleWithdraw}
          className={buttonClassnames}
        >
          Withdraw
        </Button>
      )}

      <ConditionalWrapper
        condition={!assetDepositAmount}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don’t have any ${asset.symbol}. Please first deposit ${asset.symbol} into your credit account before lending.`}</Text>
            }
          >
            {children}
          </Tooltip>
        )}
      >
        <Button
          leftIcon={<ArrowUpLine />}
          iconClassName={iconClassnames}
          disabled={!assetDepositAmount}
          color='secondary'
          onClick={() => openLend(props.data)}
          className={buttonClassnames}
        >
          Lend
        </Button>
      </ConditionalWrapper>
    </div>
  )
}

export default LendingActionButtons
