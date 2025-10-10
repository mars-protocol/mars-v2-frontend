import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ExternalLink, Verified } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import ShareBar from 'components/common/ShareBar'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { Tooltip } from 'components/common/Tooltip'
import FeeTag from 'components/managedVaults/vaultDetails/profileVaultCard/FeeTag'
import InfoRow from 'components/managedVaults/vaultDetails/profileVaultCard/InfoRow'
import TierLabel from 'components/staking/TierLabel'
import useChainConfig from 'hooks/chain/useChainConfig'
import useManagedVaultAge from 'hooks/managedVaults/useManagedVaultAge'
import useManagedVaultOwnerInfo from 'hooks/managedVaults/useManagedVaultOwnerInfo'
import useManagedVaultOwnerPosition from 'hooks/managedVaults/useManagedVaultOwnerPosition'
import useManagedVaultPnl from 'hooks/managedVaults/useManagedVaultPnl'
import { useStakedMars } from 'hooks/staking/useNeutronStakingData'
import moment from 'moment'
import Image from 'next/image'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLockupPeriod } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'

interface Props {
  details: ManagedVaultsData
  wallet?: string
  isOwner: boolean
  depositAsset: Asset
}

export default function ProfileVaultCard(props: Props) {
  const { details, isOwner, wallet, depositAsset } = props
  const { vaultOwnerInfo, isLoading } = useManagedVaultOwnerInfo(wallet)
  const { data: vaultPnl } = useManagedVaultPnl(details.vault_address)
  const vaultAge = useManagedVaultAge(details.vault_address)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const { calculateOwnerVaultShare } = useManagedVaultOwnerPosition(
    details.vault_address,
    details.ownerAddress,
  )
  const ownerSharesPercentage = calculateOwnerVaultShare(details.vault_tokens_amount)
  const { data: stakedMarsData } = useStakedMars(details.ownerAddress)

  const handleManageVault = () => {
    navigate(
      getRoute(getPage('perps', chainConfig), searchParams, address, details.vault_account_id),
    )
  }

  const vaultTitle = details.title
  const hasVaultWord = /vault/i.test(vaultTitle)
  const shareText = hasVaultWord
    ? `Check out '${vaultTitle}' on Mars Protocol!`
    : `Check out the '${vaultTitle}' Vault on Mars Protocol!`

  const apy = details.apy || 0

  return (
    <Card className='bg-surface'>
      <div className='relative mb-6'>
        <div className='overflow-hidden h-28'>
          {isLoading ? (
            <Loading className='h-28 rounded-b-none' />
          ) : (
            <Image
              src={vaultOwnerInfo.avatar.url}
              width={vaultOwnerInfo.avatar.width}
              height={vaultOwnerInfo.avatar.height}
              alt='managed vault background'
              className='w-full h-full object-cover blur-md'
              loading='lazy'
            />
          )}
        </div>
        <div className='flex absolute top-12 left-5 w-24 h-24 rounded-full border-4 border-black/70 items-center content-center justify-center bg-black/70'>
          {isLoading ? (
            <CircularProgress size={60} />
          ) : (
            <Image
              src={vaultOwnerInfo.avatar.url}
              width={vaultOwnerInfo.avatar.width}
              height={vaultOwnerInfo.avatar.height}
              alt='profile picture'
              className='w-full h-full rounded-full'
              loading='lazy'
              quality={100}
            />
          )}
        </div>
      </div>

      <div className='space-y-5 p-6'>
        <div className='flex justify-between items-center'>
          <Text tag='h4'>{details.title}</Text>
          <div className='flex gap-3'>
            <FeeTag fee={Number(details.performance_fee_config?.fee_rate ?? '0')} />
          </div>
        </div>

        <Divider />

        <div className='space-y-4'>
          <InfoRow label='Vault APY'>
            <Tooltip
              content={
                vaultAge < 30
                  ? 'This is a new vault. APY may be volatile until sufficient historical data is collected.'
                  : 'Annual Percentage Yield based on 30-day rolling average performance'
              }
              type='info'
            >
              <div className='border-b border-dashed border-white/40'>
                <FormattedNumber
                  amount={apy}
                  options={{
                    minDecimals: apy > 100 ? 0 : 2,
                    maxDecimals: apy > 100 ? 0 : 2,
                    suffix: '%',
                    abbreviated: false,
                  }}
                  className='text-sm cursor-help'
                />
              </div>
            </Tooltip>
          </InfoRow>
          <InfoRow label='Total Deposits'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(
                details.base_tokens_denom,
                BN(details.base_tokens_amount),
              )}
              className='text-sm'
            />
          </InfoRow>
          <InfoRow label='Vault PnL'>
            {!vaultPnl ? (
              <Loading className='h-4 w-20' />
            ) : (
              <Tooltip
                content={`Value of total profit/loss in ${depositAsset?.symbol || 'vault token'}`}
                type='info'
              >
                <div className='border-b border-dashed border-white/40'>
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber(
                      details.base_tokens_denom,
                      BN(vaultPnl.total_pnl),
                    )}
                    showSignPrefix
                    className={classNames(
                      'text-sm cursor-help',
                      BN(vaultPnl.total_pnl).isGreaterThan(0) && 'text-profit',
                      BN(vaultPnl.total_pnl).isLessThan(0) && 'text-loss',
                    )}
                  />
                </div>
              </Tooltip>
            )}
          </InfoRow>
          <InfoRow label='Vault Owner Shares'>
            {ownerSharesPercentage === undefined ? (
              <Loading className='h-4 w-20' />
            ) : (
              <FormattedNumber
                amount={ownerSharesPercentage}
                options={{
                  suffix: '%',
                  minDecimals: 2,
                  maxDecimals: 2,
                }}
                className='text-sm'
              />
            )}
          </InfoRow>
          <InfoRow label='Deposit Asset'>
            <div className='flex gap-2 items-center'>
              <AssetImage asset={depositAsset} className='w-4 h-4' />
              <Text size='sm'>{depositAsset.symbol}</Text>
            </div>
          </InfoRow>
          <InfoRow label='Withdrawal Freeze Period'>
            <Text size='sm'>
              {formatLockupPeriod(
                moment.duration(details.cooldown_period, 'seconds').as('days'),
                'days',
              )}
            </Text>
          </InfoRow>

          <Divider />
          <InfoRow label='Vault Manager'>
            <div className='flex items-center gap-1'>
              <TextLink
                href={vaultOwnerInfo.link.href}
                target='_blank'
                className={'leading-4 underline hover:no-underline hover:text-white'}
                title={vaultOwnerInfo.link.title}
              >
                {vaultOwnerInfo.link.name}
                <ExternalLink className='ml-2 inline w-4' />
              </TextLink>
            </div>
          </InfoRow>
          <InfoRow label='Staked Mars'>
            {!stakedMarsData ? (
              <Loading className='h-4 w-20' />
            ) : (
              <FormattedNumber
                amount={stakedMarsData.stakedAmount.toNumber()}
                options={{
                  suffix: ' MARS',
                  abbreviated: true,
                }}
                className='text-sm'
              />
            )}
          </InfoRow>
          <InfoRow label='Active Staking Benefits'>
            {!stakedMarsData ? (
              <Loading className='h-4 w-20' />
            ) : (
              <TierLabel
                amount={stakedMarsData.stakedAmount.toNumber()}
                withTooltip
                className='text-xs'
              />
            )}
          </InfoRow>
          {vaultOwnerInfo.socials.length > 0 && (
            <InfoRow label='Contact'>
              <div className='flex items-center gap-4'>
                {vaultOwnerInfo.socials.map((social, index) => (
                  <div className='flex w-4' key={index}>
                    <TextLink
                      href={social.link}
                      target='_blank'
                      className={'underline hover:no-underline hover:text-white relative'}
                      title={social.verified ? social.name : `${social.name} (unverified)`}
                    >
                      {social.icon}
                      {social.verified && (
                        <div className='w-4 absolute -top-2 -right-2 text-black'>
                          <Verified className='fill-secondary' />
                        </div>
                      )}
                    </TextLink>
                  </div>
                ))}
              </div>
            </InfoRow>
          )}
        </div>

        <Divider />

        <div className='space-y-4'>
          <Text size='sm'>Description</Text>
          <Text size='xs' className='text-white/60'>
            {details.description}
          </Text>
        </div>

        <Divider />

        <div className='flex justify-between items-center pb-4'>
          <Text size='sm'>Share Vault</Text>
          <ShareBar text={shareText} excludeWalletAddress />
        </div>

        {isOwner && !vaultOwnerInfo.hasStargazeNames && (
          <Callout type={CalloutType.INFO}>
            Setup your wallet with{' '}
            <TextLink
              href='https://www.stargaze.zone/names'
              target='_blank'
              title='Stargaze'
              textSize='extraSmall'
              className='text-purple underline'
            >
              Stargaze
            </TextLink>{' '}
            so that you can populate a profile image, name, and social links.
          </Callout>
        )}
        {isOwner && (
          <Tooltip
            type='info'
            content='This button redirects you to the Trade page and selects the vault account as your active account.'
            contentClassName='max-w-[350px]'
          >
            <Button onClick={handleManageVault} className='w-full'>
              Manage Vault
            </Button>
          </Tooltip>
        )}
      </div>
    </Card>
  )
}
