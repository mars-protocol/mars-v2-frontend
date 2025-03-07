import { useEffect, useState } from 'react'
import classNames from 'classnames'
import useStore from 'store'
import useAccounts from 'hooks/accounts/useAccounts'
import Text from 'components/common/Text'
import Accordion from 'components/common/Accordion'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccount from 'hooks/accounts/useAccount'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRoute } from 'utils/route'
import { getPage } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'

interface Props {
  selectedAccountId: string
  onAccountSelect: (accountId: string) => void
  defaultAccounts: Account[]
  usdcAccounts: Account[]
}

export function MarginTypeSelector({
  selectedAccountId,
  onAccountSelect,
  defaultAccounts,
  usdcAccounts,
}: Props) {
  const [marginType, setMarginType] = useState<'cross' | 'isolated'>('cross')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const currentAccountId = useAccountId()
  const { data: currentAccount } = useAccount(currentAccountId || undefined)
  const navigate = useNavigate()

  const relevantAccounts = marginType === 'cross' ? defaultAccounts : usdcAccounts

  useEffect(() => {
    if (currentAccountId && !selectedAccountId) {
      onAccountSelect(currentAccountId)
      if (currentAccount?.kind === 'usdc') {
        setMarginType('isolated')
      } else {
        setMarginType('cross')
      }
    }
  }, [currentAccountId, selectedAccountId, onAccountSelect, currentAccount])
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const handleAccountChange = (accountId: string) => {
    onAccountSelect(accountId)
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
    if (accounts.length === 1) {
      handleAccountChange(accounts[0].id)
    }
  }

  const marginContent = (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex gap-2'>
        <button
          onClick={() => handleMarginTypeChange('cross')}
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
          onClick={() => handleMarginTypeChange('isolated')}
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
          <Text size='sm' className='text-white/60'>
            Select {marginType === 'cross' ? 'Default' : 'USDC'} Account
          </Text>
          <select
            value={selectedAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className='w-full bg-white/10 text-white border border-white/20 rounded-lg py-2 px-3'
          >
            <option value=''>Select an account</option>
            {relevantAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                Account {account.id}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  return (
    <Accordion
      allowMultipleOpen
      items={[
        {
          title: 'Advanced Margin',
          renderContent: () => marginContent,
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
