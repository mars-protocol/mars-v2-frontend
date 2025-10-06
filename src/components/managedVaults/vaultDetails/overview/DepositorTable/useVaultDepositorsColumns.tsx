import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'
import UserAddress from 'components/managedVaults/vaultDetails/overview/DepositorTable/column/UserAddress'
import UserValue from 'components/managedVaults/vaultDetails/overview/DepositorTable/column/UserValue'
import { FormattedNumber } from 'components/common/FormattedNumber'

const createCalculatePercentage =
  (vault_tokens_amount: string) => (row: Row<ManagedVaultDepositor>) => {
    const userBalance = row.original?.balance?.amount || '0'
    const totalVaultTokens = vault_tokens_amount || '0'

    const percentage =
      totalVaultTokens && userBalance ? (Number(userBalance) / Number(totalVaultTokens)) * 100 : 0

    return percentage
  }

export default function useVaultDepositorsColumns(
  vaultAddress: string,
  baseTokensDenom: string,
  vault_tokens_amount: string,
) {
  const calculatePercentage = createCalculatePercentage(vault_tokens_amount)

  return useMemo<ColumnDef<ManagedVaultDepositor>[]>(() => {
    return [
      {
        header: 'Depositor',
        id: 'depositor',
        cell: ({ row }) => <UserAddress address={row.original.address} />,
      },
      {
        header: 'Percent of Vault Shares',
        id: 'percentage',
        enableSorting: true,
        accessorFn: calculatePercentage,
        cell: ({ row }) => (
          <FormattedNumber
            amount={calculatePercentage(row)}
            options={{ suffix: '%' }}
            className='text-xs'
          />
        ),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultAddress, baseTokensDenom, vault_tokens_amount])
}
