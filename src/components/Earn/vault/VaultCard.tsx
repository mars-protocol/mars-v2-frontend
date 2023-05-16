import { Button } from 'components/Button'
import VaultLogo from 'components/Earn/vault/VaultLogo'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'
import { formatPercent, formatValue } from 'utils/formatters'

interface Props {
  vault: Vault
  title: string
  subtitle: string
  provider?: string
  unbondingPeriod?: number
}

export default function VaultCard(props: Props) {
  const currentAccount = useCurrentAccount()

  function openVaultModal() {
    useStore.setState({ vaultModal: { vault: props.vault } })
  }

  return (
    <div className='border-r-[1px] border-r-white/10 p-4'>
      <div className='align-center mb-8 flex justify-between'>
        <div>
          <Text size='xs' className='mb-2 text-white/60'>
            {props.subtitle}
          </Text>
          <span className='flex'>
            <Text className='mr-2 font-bold'>{props.title}</Text>
            {props.provider && (
              <Text size='sm' className='text-white/60'>
                via {props.provider}
              </Text>
            )}
          </span>
        </div>
        <VaultLogo vault={props.vault} />
      </div>
      <div className='mb-6 flex justify-between'>
        <TitleAndSubCell
          className='text-xs'
          title={props.vault.apy ? formatPercent(props.vault.apy, 2) : '-'}
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
      <Button
        color='secondary'
        onClick={openVaultModal}
        className='w-full'
        disabled={!currentAccount}
      >
        {currentAccount ? 'Deposit' : 'Select Account'}
      </Button>
    </div>
  )
}
