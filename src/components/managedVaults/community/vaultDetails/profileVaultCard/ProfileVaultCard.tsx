import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
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
import FeeTag from 'components/managedVaults/community/vaultDetails/profileVaultCard/FeeTag'
import InfoRow from 'components/managedVaults/community/vaultDetails/profileVaultCard/InfoRow'
import useManagedVaultOwnerInfo from 'hooks/managedVaults/useManagedVaultOwnerInfo'
import moment from 'moment'
import Image from 'next/image'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLockupPeriod } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  details: ExtendedManagedVaultDetails
  wallet?: string
  isOwner: boolean
  depositAsset: Asset
}

export default function ProfileVaultCard(props: Props) {
  const { details, isOwner, wallet, depositAsset } = props
  const { vaultOwnerInfo, isLoading } = useManagedVaultOwnerInfo(wallet)

  return (
    <Card className='bg-white/5'>
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
            {isOwner || <FeeTag fee={details.performance_fee_config?.fee_rate ?? '0'} />}
          </div>
        </div>

        <Divider />

        <div className='space-y-4'>
          <InfoRow label='APY'>
            <FormattedNumber
              amount={details.metrics.apy || 0}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-sm'
            />
          </InfoRow>
          <InfoRow label='TVL'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(
                details.base_tokens_denom,
                BN(details.base_tokens_amount),
              )}
              className='text-sm'
            />
          </InfoRow>
          <InfoRow label='Accrued PnL'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(
                details.base_tokens_denom,
                BN(details.performance_fee_state.accumulated_pnl),
              )}
              showSignPrefix
              className={classNames(
                'text-sm',
                BN(details.performance_fee_state.accumulated_pnl).isGreaterThan(0) && 'text-profit',
                BN(details.performance_fee_state.accumulated_pnl).isLessThan(0) && 'text-loss',
              )}
            />
          </InfoRow>
          <InfoRow label='Deposit Asset'>
            <div className='flex gap-2 items-center'>
              <AssetImage asset={depositAsset} className='w-4 h-4' />
              <Text size='sm'>{depositAsset.symbol}</Text>
            </div>
          </InfoRow>
          <InfoRow label='Withdrawal Freeze Period'>
            {/* TODO: temporary UI for freeze period in minutes */}
            {moment.duration(details.cooldown_period, 'seconds').as('days') < 1 ? (
              <Text size='sm'>
                {formatLockupPeriod(
                  moment.duration(details.cooldown_period, 'seconds').as('minutes'),
                  'minutes',
                )}
              </Text>
            ) : (
              <Text size='sm'>
                {formatLockupPeriod(
                  moment.duration(details.cooldown_period, 'seconds').as('days'),
                  'days',
                )}
              </Text>
            )}
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
          {vaultOwnerInfo.socials.length > 0 && (
            <InfoRow label='Contact'>
              <div className='flex items-center gap-4'>
                {vaultOwnerInfo.socials.map((social, index) => (
                  <div className='flex w-4'>
                    <TextLink
                      key={index}
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
          <ShareBar text='Vault Details' />
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
      </div>
    </Card>
  )
}
