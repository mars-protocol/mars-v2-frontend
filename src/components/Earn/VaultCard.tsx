'use client'

import { Button } from 'components/Button'
import VaultLogo from 'components/Earn/VaultLogo'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { getAssetByDenom } from 'utils/assets'
import { formatPercent, formatValue } from 'utils/formatters'

interface Props {
  vault: Vault
}

export default function VaultCard(props: Props) {
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
        <VaultLogo vault={props.vault} />
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
