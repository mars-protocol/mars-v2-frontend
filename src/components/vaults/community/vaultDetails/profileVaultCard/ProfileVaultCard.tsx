import classNames from 'classnames'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import HLSTag from 'components/hls/HlsTag'
import FeeTag from 'components/vaults/community/vaultDetails/profileVaultCard/FeeTag'
import InfoRow from 'components/vaults/community/vaultDetails/profileVaultCard/InfoRow'
import ShareBar from 'components/common/ShareBar'
import Text from 'components/common/Text'
import React from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ExternalLink, TrashBin } from 'components/common/Icons'
import { TextLink } from 'components/common/TextLink'

interface Props {
  vaultTitle: string
  apr: number
  tvl: number
  accuredPnl: number
  wallet: string
  description: string
  onDelete: () => void
  onEdit: (show: boolean) => void
  avatarUrl: string
  address?: string
}

export default function ProfileVaultCard(props: Props) {
  const {
    vaultTitle,
    apr,
    tvl,
    accuredPnl,
    wallet,
    description,
    address,
    onDelete,
    onEdit,
    avatarUrl,
  } = props

  const isOwner = Boolean(address)

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
          <Text tag='h4'>{vaultTitle}</Text>
          <div className='flex gap-3'>
            {/* TODO: this will be conditional render */}
            <HLSTag />
            {/* TODO: send fetched value */}
            {isOwner || <FeeTag fee='5' />}
          </div>
        </div>

        <Divider />

        <div className='space-y-4'>
          <InfoRow label='APR'>
            <FormattedNumber
              amount={apr}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-sm'
            />
          </InfoRow>
          <InfoRow label='TVL'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber('usd', BN(tvl))}
              className='text-sm'
            />
          </InfoRow>
          {isOwner ? (
            <>
              <InfoRow label='Accrued PnL'>
                <DisplayCurrency
                  coin={BNCoin.fromDenomAndBigNumber('usd', BN(accuredPnl))}
                  // TODO:conditional classnames for profit/loss
                  className={classNames('text-profit text-sm')}
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
              {/* fetch values */}
              <InfoRow label='Deposit Asset'>
                <Text size='sm'>USDC</Text>
              </InfoRow>
              <InfoRow label=' Withdrawal Freeze Period'>
                <Text size='sm'>7 days</Text>
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
            {description}
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
