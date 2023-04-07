'use client'

import Image from 'next/image'

import { Text } from 'components/Text'
import { getAssetByDenom } from 'utils/assets'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { formatPercent, formatValue } from 'utils/formatters'
import { Button } from 'components/Button'

interface Props {
  vault: Vault
}

export default function VaultCard(props: Props) {
  const primaryAsset = getAssetByDenom(props.vault.denoms.primary)
  const secondaryAsset = getAssetByDenom(props.vault.denoms.secondary)

  if (!primaryAsset || !secondaryAsset) return null

  function openVaultModal() {}

  return (
    <div className='border-r-[1px] border-r-white/10 p-4'>
      <div className='align-center mb-8 flex justify-between'>
        <div>
          <Text size='xs' className='mb-2 text-white/60'>
            Hot off the presses
          </Text>
          <span className='flex'>
            <Text className='mr-2 font-bold'>{props.vault.name}</Text>
            <Text size='sm' className='text-white/60'>
              via {props.vault.provider}
            </Text>
          </span>
        </div>
        <div className='relative grid w-12 place-items-center'>
          <div className='absolute'>
            <Image src={primaryAsset.logo} alt='token' width={24} height={24} />
          </div>
          <div className='absolute'>
            <Image
              className='ml-5 mt-5'
              src={secondaryAsset.logo}
              alt='token'
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
      <div className='mb-6 flex justify-between'>
        <TitleAndSubCell
          className='text-xs'
          title={props.vault.apy ? formatPercent(props.vault.apy) : '-'}
          sub={'APY'}
        />
        <TitleAndSubCell
          className='text-xs'
          title={`${props.vault.lockup.duration} ${props.vault.lockup.timeframe}`}
          sub={'Lockup'}
        />
        <TitleAndSubCell
          className='text-xs'
          title={formatValue(props.vault.cap.used || '0', {
            abbreviated: true,
            decimals: getAssetByDenom(props.vault.cap.denom)?.decimals,
          })}
          sub={'TVL'}
        />
        <TitleAndSubCell
          className='text-xs'
          title={formatValue(props.vault.cap.max || '0', {
            abbreviated: true,
            decimals: getAssetByDenom(props.vault.cap.denom)?.decimals,
          })}
          sub={'Depo. Cap'}
        />
      </div>
      <Button color='secondary' onClick={openVaultModal} className='w-full'>
        Deposit
      </Button>
    </div>
  )
}
