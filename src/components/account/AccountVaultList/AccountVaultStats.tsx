import Button from 'components/common/Button'
import Divider from 'components/common/Divider'
import Skeleton from 'components/account/AccountVaultList/Skeleton'
import { BN } from 'utils/helpers'
import { TrashBin } from 'components/common/Icons'
import { useCallback } from 'react'

interface Props {
  isActive?: boolean
  setShowMenu?: (show: boolean) => void
}

export default function AccountVaultStats(props: Props) {
  const { isActive, setShowMenu } = props

  const deleteVaultHandler = useCallback(() => {
    console.log('deleteVaultHandler')
  }, [])

  return (
    <div className='w-full p-4'>
      {/* TODO: fetch values */}
      <Skeleton health={23} healthFactor={2} positionBalance={BN(190000)} risk={12} />

      {isActive && setShowMenu && (
        <>
          <Divider className='my-4' />
          <Button
            color='tertiary'
            text='Delete'
            onClick={() => {
              setShowMenu(false)
              deleteVaultHandler()
            }}
            leftIcon={<TrashBin />}
            className='w-full'
          />
        </>
      )}
    </div>
  )
}
