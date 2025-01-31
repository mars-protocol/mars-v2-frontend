import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ExternalLink, TrashBin } from 'components/common/Icons'
import ShareBar from 'components/common/ShareBar'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import FeeTag from 'components/vaults/community/vaultDetails/profileVaultCard/FeeTag'
import InfoRow from 'components/vaults/community/vaultDetails/profileVaultCard/InfoRow'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import moment from 'moment'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatLockupPeriod } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  details: ExtendedManagedVaultDetails
  wallet: string
  onDelete: () => void
  onEdit: (show: boolean) => void
  avatarUrl: string
  isOwner: boolean
}

export default function ProfileVaultCard(props: Props) {
  const { details, isOwner, wallet = '', avatarUrl = '', onDelete, onEdit } = props
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(details.base_token)) as Asset

  return (
    <Card className='bg-white/5'>
      {/* TODO: only demo, to be updated depending on how and if we get the users pic */}
      <div className='relative mb-6'>
        <div className='overflow-hidden h-28'>
          {/* demo */}
          <img
            src={avatarUrl}
            width={50}
            height={50}
            alt={'profile'}
            className='w-full h-full object-cover blur-xl'
            loading='lazy'
          />
        </div>
        <div className='absolute top-12 left-5 w-24 h-24 rounded-full border-4 border-black/70 '>
          {/* demo */}
          <img
            src={avatarUrl}
            width={24}
            height={24}
            alt={'profile'}
            className='w-full h-full rounded-full'
            loading='lazy'
          />
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
          <InfoRow label='APR'>
            <FormattedNumber
              amount={Number(details.metrics.apr)}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-sm'
            />
          </InfoRow>
          <InfoRow label='TVL'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber('usd', BN(details.metrics.tvl))}
              className='text-sm'
            />
          </InfoRow>
          {isOwner ? (
            <>
              <InfoRow label='Accrued PnL'>
                <DisplayCurrency
                  coin={BNCoin.fromDenomAndBigNumber(
                    'usd',
                    BN(details.performance_fee_state.accumulated_pnl),
                  )}
                  className={classNames(
                    'text-sm text-white',
                    BN(details.performance_fee_state.accumulated_pnl).isGreaterThan(0) &&
                      'text-profit',
                    BN(details.performance_fee_state.accumulated_pnl).isNegative() && 'text-loss',
                  )}
                />
              </InfoRow>
              <InfoRow label='Wallet'>
                <div className='flex items-center gap-1'>
                  <Text size='sm' className='text-primary'>
                    {wallet}
                  </Text>
                  <ExternalLink className='w-4 h-4 text-primary' />
                </div>
              </InfoRow>
            </>
          ) : (
            <>
              {depositAsset && (
                <InfoRow label='Deposit Asset'>
                  <div className='flex gap-2 items-center'>
                    <AssetImage asset={depositAsset} className='w-4 h-4' />
                    <Text size='sm'>{depositAsset.symbol}</Text>
                  </div>
                </InfoRow>
              )}
              <InfoRow label='Withdrawal Freeze Period'>
                <Text size='sm'>
                  {formatLockupPeriod(
                    moment.duration(details.cooldown_period, 'seconds').as('days'),
                    'days',
                  )}
                </Text>
              </InfoRow>
            </>
          )}
        </div>

        <Divider />

        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <Text size='sm'>Description</Text>
            {isOwner && (
              <Button
                onClick={() => onEdit(true)}
                variant='transparent'
                color='quaternary'
                className='!p-0'
                textClassNames='text-secondary hover:text-primary'
                text='Edit'
              />
            )}
          </div>
          <Text size='xs' className='text-white/60'>
            {details.description}
          </Text>
        </div>

        <Divider />

        <div className='flex justify-between items-center pb-4'>
          <Text size='sm'>Socials</Text>
          <ShareBar text='Vault Details' />
        </div>

        {isOwner && (
          // check if no cns
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
            or an{' '}
            <TextLink
              href='https://medium.com/@icns/announcing-icns-the-interchain-name-service-e61e0c3e2abb'
              target='_blank'
              title='Stargaze'
              textSize='extraSmall'
              className='text-purple underline'
            >
              IBC/ICNS Domain
            </TextLink>{' '}
            so that you can populate a profile image, name, and social links.
          </Callout>
        )}

        {isOwner && (
          <Button
            text='Delete Vault'
            color='secondary'
            onClick={onDelete}
            disabled={true}
            leftIcon={<TrashBin />}
            iconClassName='w-3'
            className='w-full'
          />
        )}
      </div>
    </Card>
  )
}
