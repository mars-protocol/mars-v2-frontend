import Accordion from 'components/Accordion'
import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import AccountHealth from 'components/Account/AccountHealth'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountValue } from 'utils/accounts'
import { formatHealth } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  account?: Account
  change?: AccountChange
}

export default function AccountSummary(props: Props) {
  const [isOpen, toggleOpen] = useIsOpenArray(2, true)
  const { data: prices } = usePrices()
  const accountBalance = props.account
    ? calculateAccountValue('deposits', props.account, prices)
    : BN_ZERO
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const borrowAssetsData = [...borrowAvailableAssets, ...accountBorrowedAssets]
  const lendingAssetsData = [...lendingAvailableAssets, ...accountLentAssets]

  const { health } = useHealthComputer(props.account)
  const healthFactor = BN(100).minus(formatHealth(health)).toNumber()
  if (!props.account) return null

  return (
    <div className='h-[546px] min-w-[345px] basis-[345px] overflow-y-scroll scrollbar-hide'>
      <Card className='mb-4 h-min min-w-fit bg-white/10' contentClassName='flex'>
        <Item>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
            className='text-sm'
          />
        </Item>
        <Item>
          <AccountHealth health={healthFactor} />
        </Item>
      </Card>
      <Accordion
        items={[
          {
            title: `Subaccount ${props.account.id} Composition`,
            renderContent: () =>
              props.account ? (
                <AccountComposition account={props.account} change={props.change} />
              ) : null,
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
            renderSubTitle: () => <></>,
          },
          {
            title: 'Balances',
            renderContent: () =>
              props.account ? (
                <AccountBalancesTable
                  account={props.account}
                  borrowingData={borrowAssetsData}
                  lendingData={lendingAssetsData}
                />
              ) : null,
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
            renderSubTitle: () => <></>,
          },
        ]}
        allowMultipleOpen
      />
    </div>
  )
}

function Item(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className='flex items-center justify-center flex-1 gap-1 px-2 py-2 border-r border-r-white/10'
      {...props}
    >
      {props.children}
    </div>
  )
}
