import classNames from 'classnames'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ExternalLink, TrashBin } from 'components/common/Icons'
import ShareBar from 'components/common/ShareBar'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import HLSTag from 'components/hls/HLSTag'
import React from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  vaultName: string
  apr: number
  tvl: number
  accuredPnl: number
  wallet: string
  description: string
  onEdit: () => void
  onDelete: () => void
  avatarUrl: string
}

export default function ProfileVaultCard(props: Props) {
  const { vaultName, apr, tvl, accuredPnl, wallet, description, onEdit, onDelete, avatarUrl } =
    props

  return (
    <div className='bg-white/5 p-6 rounded-lg text-white space-y-4'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col items-center space-x-4'>
          <Text tag='h4'>{vaultName}</Text>
        </div>
        <HLSTag />
      </div>

      <div className='space-y-3'>
        <div className='flex justify-between'>
          <Text className='text-white/60'>APR</Text>
          <FormattedNumber amount={apr} options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }} />
        </div>
        <div className='flex justify-between'>
          <Text className='text-white/60'>TVL</Text>
          <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(tvl))} />
        </div>
        <div className='flex justify-between'>
          <Text className='text-white/60'>Accured PnL</Text>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', BN(accuredPnl))}
            // TODO: conditional classname text-profit / text-loss
            className={classNames('text-profit')}
          />
        </div>
        <div className='flex justify-between'>
          <Text className='text-white/60'>Wallet</Text>
          <div className='flex items-center gap-1'>
            <Text className='text-primary'>{wallet}</Text>
            <ExternalLink className='w-4 h-4 text-primary' />
          </div>
        </div>
      </div>

      <Divider />

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Text>Description</Text>
          <Text size='sm' className='text-warning'>
            Edit
          </Text>
        </div>
        <Text size='sm' className='text-white/60'>
          {description}
        </Text>
      </div>

      <Divider />

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Text>Socials</Text>
          <ShareBar text='Share this vault' />
        </div>

        <Callout type={CalloutType.INFO} className=''>
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

        <Button
          text='Delete Vault'
          color='secondary'
          onClick={onDelete}
          disabled={false}
          leftIcon={<TrashBin />}
          iconClassName='w-3'
          className='w-full'
        />
      </div>
    </div>
  )
}
