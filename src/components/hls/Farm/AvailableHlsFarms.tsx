import { useCallback, useMemo, useState } from 'react'

import AlertDialog from 'components/common/AlertDialog'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { ArrowRight } from 'components/common/Icons'
import AvailableHlsFarmsTable from 'components/hls/Farm/Table/AvailableHlsFarmsTable'
import { HLS_INFO_ITEMS } from 'components/hls/Staking/Table/Columns/Deposit'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export function AvailableHlsFarms() {
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

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Available High Leverage Farms',
        renderContent: () => <AvailableHlsFarmsTable openHlsInfoDialog={openHlsInfoDialog} />,
      },
    ],
    [openHlsInfoDialog],
  )

  return (
    <>
      <CardWithTabs tabs={tabs} />
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
