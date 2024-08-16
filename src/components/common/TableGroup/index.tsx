import { ColumnDef, OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useState } from 'react'

import Table from 'components/common/Table'
import Text from 'components/common/Text'
import { Callout, CalloutType } from 'components/common/Callout'

interface TableGroupProps<T extends { denom: string }> {
  primaryData: T[]
  secondaryData?: T[]
  columns: ColumnDef<T>[]
  initialSorting: SortingState
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  primaryTitle: string
  secondaryTitle?: string
  emptyPrimaryMessage?: string
}

export default function TableGroup<T extends { denom: string }>({
  primaryData,
  secondaryData,
  columns,
  initialSorting,
  onChangeSelected,
  selectedDenoms,
  primaryTitle,
  secondaryTitle,
  emptyPrimaryMessage,
}: TableGroupProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [primarySelected, setPrimarySelected] = useState<RowSelectionState>({})
  const [secondarySelected, setSecondarySelected] = useState<RowSelectionState>({})

  const updateSelectedDenoms = useCallback(
    (primary: RowSelectionState, secondary: RowSelectionState) => {
      const selectedPrimary = primaryData.filter((_, index) => primary[index])
      const selectedSecondary = secondaryData?.filter((_, index) => secondary[index]) || []
      const newSelectedDenoms = [...selectedPrimary, ...selectedSecondary].map((item) => item.denom)
      onChangeSelected(newSelectedDenoms)
    },
    [primaryData, secondaryData, onChangeSelected],
  )

  const handlePrimarySelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === 'function' ? updaterOrValue(primarySelected) : updaterOrValue
      setPrimarySelected(newSelection)
      updateSelectedDenoms(newSelection, secondarySelected)
    },
    [primarySelected, secondarySelected, updateSelectedDenoms],
  )

  const handleSecondarySelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === 'function' ? updaterOrValue(secondarySelected) : updaterOrValue
      setSecondarySelected(newSelection)
      updateSelectedDenoms(primarySelected, newSelection)
    },
    [primarySelected, secondarySelected, updateSelectedDenoms],
  )
  return (
    <>
      {secondaryData && (
        <Text
          size='xs'
          className='p-4 font-semibold bg-black/20 text-white/60 border-t border-b border-white/10'
        >
          {primaryTitle}
        </Text>
      )}
      <Table
        title={primaryTitle}
        columns={columns}
        data={primaryData}
        initialSorting={sorting}
        onSortingChange={setSorting}
        setRowSelection={handlePrimarySelectionChange}
        selectedRows={primarySelected}
        hideCard
      />
      {primaryData.length === 0 && emptyPrimaryMessage && (
        <Callout type={CalloutType.INFO} className='px-4 py-2 text-white/60 m-4'>
          {emptyPrimaryMessage}
        </Callout>
      )}
      {secondaryData && secondaryData.length > 0 && (
        <>
          <Text
            size='xs'
            className='p-4 font-semibold bg-black/20 text-white/60 border-t border-b border-white/10'
          >
            {secondaryTitle}
          </Text>
          <Table
            title={secondaryTitle || ''}
            columns={columns}
            data={secondaryData}
            initialSorting={sorting}
            onSortingChange={undefined}
            setRowSelection={handleSecondarySelectionChange}
            selectedRows={secondarySelected}
            disableSortingRow
            hideCard
          />
        </>
      )}
    </>
  )
}
