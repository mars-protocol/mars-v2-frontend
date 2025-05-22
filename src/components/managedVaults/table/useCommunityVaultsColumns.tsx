import { ColumnDef, Row } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/table/column/Fee'
import Title, { TITLE_META } from 'components/managedVaults/table/column/Title'
import MyPosition, { MY_POSITION_META } from 'components/managedVaults/table/column/MyPosition'
import TVL, { TVL_META } from 'components/managedVaults/table/column/TVL'
import Details, { DETAILS_META } from 'components/managedVaults/table/column/Details'
import { useCallback, useMemo } from 'react'
import { convertAprToApy } from 'utils/parsers'
import Button from 'components/common/Button'
import useStore from 'store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPage, getRoute } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'

interface Props {
  isLoading: boolean
  showPosition?: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading, showPosition } = props
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const handleContinueSetup = useCallback(() => {
    const storedVault = localStorage.getItem('pendingVaultMint')
    if (!storedVault) return

    try {
      const parsedVault = JSON.parse(storedVault)
      navigate(getRoute(getPage('vaults/create', chainConfig), searchParams, address), {
        state: { pendingVault: parsedVault },
      })
    } catch {
      return null
    }
  }, [navigate, chainConfig, searchParams, address])

  return useMemo<ColumnDef<ManagedVaultWithDetails>[]>(() => {
    return [
      {
        ...TITLE_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Title value={row.original} isLoading={isLoading} />
        ),
      },
      ...(showPosition
        ? [
            {
              ...MY_POSITION_META,
              cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
                <MyPosition vault={row.original} isLoading={isLoading} />
              ),
            },
          ]
        : []),
      {
        ...TVL_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <TVL value={row.original} isLoading={isLoading} />
        ),
      },
      {
        ...APY_META,
        accessorKey: 'apr',
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Apy
            isLoading={isLoading}
            borrowEnabled={true}
            apy={convertAprToApy(Number(row.original.apr ?? 0), 365)}
          />
        ),
      },
      {
        ...FEE_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Fee value={row.original.fee_rate} isLoading={isLoading} />
        ),
      },
      {
        ...DETAILS_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) =>
          row.original.isPending ? (
            <div className='flex items-center justify-end'>
              <Button onClick={handleContinueSetup} text='Continue Setup' />
            </div>
          ) : (
            <Details isLoading={isLoading} vault={row.original} />
          ),
      },
    ]
  }, [isLoading, showPosition, handleContinueSetup])
}
