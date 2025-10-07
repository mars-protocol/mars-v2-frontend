import UserAddress from 'components/managedVaults/vaultDetails/overview/DepositorTable/column/UserAddress'
import UserValue from 'components/managedVaults/vaultDetails/overview/DepositorTable/column/UserValue'
import { ColumnDef } from '@tanstack/react-table'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useMemo } from 'react'

const calculatePercentage = (userBalance: string, totalVaultTokens: string): number => {
  return totalVaultTokens && userBalance
    ? (Number(userBalance) / Number(totalVaultTokens)) * 100
    : 0
}

export default function useVaultDepositorsColumns(
  vaultAddress: string,
  baseTokensDenom: string,
  vaultTokensAmount: string,
  ownerAddress: string,
) {
  return useMemo<ColumnDef<ManagedVaultDepositor>[]>(() => {
    return [
      {
        header: 'Depositor',
        id: 'depositor',
        cell: ({ row }) => (
          <UserAddress
            address={row.original.address}
            vaultAddress={vaultAddress}
            ownerAddress={ownerAddress}
          />
        ),
      },
      {
        header: 'Percent of Vault Shares',
        id: 'percentage',
        enableSorting: true,
        accessorFn: (row) => calculatePercentage(row.balance?.amount || '0', vaultTokensAmount),
        cell: ({ row }) => {
          const percentage = calculatePercentage(
            row.original.balance?.amount || '0',
            vaultTokensAmount,
          )
          return (
            <FormattedNumber amount={percentage} options={{ suffix: '%' }} className='text-xs' />
          )
        },
      },
      {
        header: 'Value',
        id: 'value',
        cell: ({ row }) => (
          <UserValue
            value={row.original}
            vaultAddress={vaultAddress}
            baseTokensDenom={baseTokensDenom}
          />
        ),
      },
    ]
  }, [vaultAddress, baseTokensDenom, vaultTokensAmount, ownerAddress])
}
