import classNames from 'classnames'
import React from 'react'

import AssetImage from 'components/common/assets/AssetImage'
import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAsset from 'hooks/assets/useAsset'
import { VaultStatus } from 'types/enums/vault'
import { produceCountdown } from 'utils/formatters'

export const NAME_META = { id: 'name', header: 'Vault', accessorKey: 'name' }
interface Props {
  vault: Vault | DepositedVault
}

export default function Name(props: Props) {
  const { vault } = props
  const timeframe = vault.lockup.timeframe[0]
  const unlockDuration = !!timeframe ? ` - (${vault.lockup.duration}${timeframe})` : ''
  const primaryAsset = useAsset(vault.denoms.primary)
  let remainingTime = 0
  let status: VaultStatus = VaultStatus.ACTIVE
  if ('status' in vault) {
    status = vault.status as VaultStatus
    if (vault.status === VaultStatus.UNLOCKING && vault.unlocksAt) {
      remainingTime = vault.unlocksAt - Date.now()
    }
  }

  if (!primaryAsset) return null

  return (
    <div className='flex'>
      {vault.denoms.secondary === '' ? (
        <AssetImage asset={primaryAsset} size={32} />
      ) : (
        <DoubleLogo primaryDenom={vault.denoms.primary} secondaryDenom={vault.denoms.secondary} />
      )}

      <TitleAndSubCell
        className='ml-2 mr-2 text-left'
        title={`${vault.name}${unlockDuration}`}
        sub={vault.provider}
      />
      {status === VaultStatus.UNLOCKING && (
        <Text
          className='group/label relative h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
          size='xs'
        >
          <span
            className={classNames(
              'absolute inset-0 text-center',
              'opacity-100 transition-opacity duration-500',
              'group-hover/label:opacity-0 group-[.is-expanded]/row:opacity-0',
            )}
          >
            Unlocking
          </span>
          <span
            className={classNames(
              'absolute inset-0 text-center',
              'opacity-0 transition-opacity duration-500',
              'group-hover/label:opacity-100 group-[.is-expanded]/row:opacity-100',
            )}
          >
            {produceCountdown(remainingTime)}
          </span>
        </Text>
      )}
      {status === VaultStatus.UNLOCKED && (
        <Text
          className='h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
          size='xs'
        >
          Unlocked
        </Text>
      )}
    </div>
  )
}
