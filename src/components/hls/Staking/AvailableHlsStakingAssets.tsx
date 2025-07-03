import { Suspense, useCallback, useState } from 'react'

import AlertDialog from 'components/common/AlertDialog'
import { ArrowRight } from 'components/common/Icons'
import Table from 'components/common/Table'
import { HLS_INFO_ITEMS } from 'components/hls/Staking/Table/Columns/Deposit'
import { NAME_META } from 'components/hls/Staking/Table/Columns/Name'
import useAvailableColumns from 'components/hls/Staking/Table/Columns/useAvailableColumns'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useHlsStakingAssets from 'hooks/hls/useHlsStakingAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

const title = 'Available Strategies'

interface ContentProps {
  openHlsInfoDialog: (continueCallback: () => void) => void
}

function Content({ openHlsInfoDialog }: ContentProps) {
  const { data: hlsStrategies } = useHlsStakingAssets()
  const columns = useAvailableColumns({ isLoading: false, openHlsInfoDialog })

  return (
    <Table
      title={title}
      columns={columns}
      data={hlsStrategies}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
    />
  )
}

interface FallbackProps {
  openHlsInfoDialog: (continueCallback: () => void) => void
}

function Fallback({ openHlsInfoDialog }: FallbackProps) {
  const columns = useAvailableColumns({ isLoading: true, openHlsInfoDialog })

  return (
    <Table
      title={title}
      columns={columns}
      data={[]}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
    />
  )
}

export default function AvailableHlsStakings() {
  const [showHlsInfo, setShowHlsInfo] = useLocalStorage<boolean>(
    LocalStorageKeys.HLS_INFORMATION,
    true,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [onContinue, setOnContinue] = useState<(() => void) | null>(null)

  const openHlsInfoDialog = useCallback(
    (continueCallback: () => void) => {
      if (!showHlsInfo) {
        continueCallback()
        return
      }
      setOnContinue(() => continueCallback)
      setIsDialogOpen(true)
    },
    [showHlsInfo],
  )

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setOnContinue(null)
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    }
    setIsDialogOpen(false)
    setOnContinue(null)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setOnContinue(null)
  }

  return (
    <>
      <Suspense fallback={<Fallback openHlsInfoDialog={openHlsInfoDialog} />}>
        <Content openHlsInfoDialog={openHlsInfoDialog} />
      </Suspense>
      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title='Understanding Hls Positions'
        content={<AlertDialogItems items={HLS_INFO_ITEMS} />}
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleContinue,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleCancel,
        }}
        checkbox={{
          text: "Don't show again",
          onClick: (isChecked: boolean) => setShowHlsInfo(!isChecked),
        }}
      />
    </>
  )
}
