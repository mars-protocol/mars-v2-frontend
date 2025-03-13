import { useEffect, useState } from 'react'
import classNames from 'classnames'
import useStore from 'store'
import Text from 'components/common/Text'
import Accordion from 'components/common/Accordion'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccount from 'hooks/accounts/useAccount'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRoute } from 'utils/route'
import { getPage } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'
import Select from 'components/common/Select'
import { LocalStorageKeys } from 'constants/localStorageKeys'

interface Props {
  selectedAccountId: string
  onAccountSelect: (accountId: string) => void
  defaultAccounts: Account[]
  usdcAccounts: Account[]
  onReset?: () => void
}

export function MarginTypeSelector({
  selectedAccountId,
  onAccountSelect,
  defaultAccounts,
  usdcAccounts,
  onReset,
}: Props) {
  const [marginType, setMarginType] = useState<'cross' | 'isolated'>('cross')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const currentAccountId = useAccountId()
  const { data: currentAccount } = useAccount(currentAccountId || undefined)
  const navigate = useNavigate()
  const lastUsdcAccountKey = LocalStorageKeys.LAST_USDC_ACCOUNT
  const lastCrossAccountKey = LocalStorageKeys.LAST_CROSS_ACCOUNT

  const relevantAccounts = marginType === 'cross' ? defaultAccounts : usdcAccounts

  useEffect(() => {
    if (currentAccountId && !selectedAccountId) {
      onAccountSelect(currentAccountId)
      if (currentAccount?.kind === 'usdc') {
        setMarginType('isolated')
        const lastUsdcAccount = localStorage.getItem(lastUsdcAccountKey)
        if (lastUsdcAccount && usdcAccounts.some((acc) => acc.id === lastUsdcAccount)) {
          onAccountSelect(lastUsdcAccount)
        }
      } else {
        setMarginType('cross')
        const lastCrossAccount = localStorage.getItem(lastCrossAccountKey)
        if (lastCrossAccount && defaultAccounts.some((acc) => acc.id === lastCrossAccount)) {
          onAccountSelect(lastCrossAccount)
        }
      }
    }
  }, [
    currentAccountId,
    selectedAccountId,
    onAccountSelect,
    currentAccount,
    usdcAccounts,
    defaultAccounts,
    lastUsdcAccountKey,
    lastCrossAccountKey,
  ])

  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)

  const handleAccountChange = (accountId: string) => {
    onAccountSelect(accountId)

    if (marginType === 'isolated') {
      localStorage.setItem(lastUsdcAccountKey, accountId)
    } else {
      localStorage.setItem(lastCrossAccountKey, accountId)
    }
    navigate(
      getRoute(
        getPage(`/perps?accountId=${accountId}`, chainConfig),
        searchParams,
        address,
        accountId,
      ),
    )
  }

  const handleMarginTypeChange = (type: 'cross' | 'isolated') => {
    setMarginType(type)
    const accounts = type === 'cross' ? defaultAccounts : usdcAccounts
    const lastAccountKey = type === 'cross' ? lastCrossAccountKey : lastUsdcAccountKey
    const lastAccount = localStorage.getItem(lastAccountKey)

    if (lastAccount && accounts.some((acc) => acc.id === lastAccount)) {
      handleAccountChange(lastAccount)
    } else if (accounts.length > 0) {
      handleAccountChange(accounts[0].id)
    }
    onReset?.()
  }

  const relevantAccountsOptions: SelectOption[] = relevantAccounts.map((account) => ({
    label: `Account ${account.id}`,
    value: account.id,
  }))

  const marginContent = (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex gap-2'>
        <button
          onClick={() => {
            handleMarginTypeChange('cross')
          }}
          className={classNames(
            'flex-1 py-2 px-4 rounded-lg transition-colors',
            marginType === 'cross'
              ? 'bg-primary text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20',
          )}
        >
          Cross
        </button>
        <button
          onClick={() => {
            handleMarginTypeChange('isolated')
          }}
          className={classNames(
            'flex-1 py-2 px-4 rounded-lg transition-colors',
            marginType === 'isolated'
              ? 'bg-primary text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20',
          )}
        >
          USDC
        </button>
      </div>

      {relevantAccounts.length > 1 && (
        <div className='flex flex-col gap-2'>
          <Select
            options={relevantAccountsOptions}
            onChange={handleAccountChange}
            defaultValue={selectedAccountId}
            className='border border-white/20 rounded-lg'
            label={`Select ${marginType === 'cross' ? 'Default' : 'USDC'} Account`}
            isParent={true}
          />
        </div>
      )}
    </div>
  )

  return (
    <Accordion
      allowMultipleOpen
      allowOverflow
      items={[
        {
          title: 'Advanced Margin',
          renderContent: () => (isAdvancedOpen ? marginContent : null),
          renderSubTitle: () => {
            if (!selectedAccountId) return null
            const accountType = marginType === 'cross' ? 'Default' : 'USDC'
            return (
              <Text size='xs' className='mt-1 text-white/60'>
                {accountType} Account {selectedAccountId}
              </Text>
            )
          },
          isOpen: isAdvancedOpen,
          toggleOpen: () => setIsAdvancedOpen(!isAdvancedOpen),
        },
      ]}
    />
  )
}
