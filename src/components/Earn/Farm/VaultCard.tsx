import ActionButton from 'components/Button/ActionButton'
import DoubleLogo from 'components/DoubleLogo'
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
    useStore.setState({
      vaultModal: {
        vault: props.vault,
        selectedBorrowDenoms: [props.vault.denoms.secondary],
        isCreate: true,
      },
    })
  }

  return (
    <div className='border-r-[1px] border-r-white/10 p-4'>
      <div className='flex justify-between mb-8 align-center'>
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
        <DoubleLogo
          primaryDenom={props.vault.denoms.primary}
          secondaryDenom={props.vault.denoms.secondary}
        />
      </div>
      <div className='flex justify-between mb-6'>
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
          title={formatValue(props.vault.cap.used.integerValue().toNumber() || '0', {
            abbreviated: true,
            decimals: getAssetByDenom(props.vault.cap.denom)?.decimals,
          })}
          sub={'TVL'}
        />
        <TitleAndSubCell
          className='text-xs'
          title={formatValue(props.vault.cap.max.integerValue().toNumber() || '0', {
            abbreviated: true,
            decimals: getAssetByDenom(props.vault.cap.denom)?.decimals,
          })}
          sub={'Deposit Cap'}
        />
      </div>
      <ActionButton onClick={openVaultModal} color='secondary' text='Deposit' className='w-full' />
    </div>
  )
}
