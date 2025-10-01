import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import { Cross } from 'components/common/Icons'
import Text from 'components/common/Text'
import React from 'react'

interface Props {
  asset?: Asset
  title: React.ReactNode
  description: string
  button: React.ReactNode
  onClose?: () => void
}

export default function Banner(props: Props) {
  const { asset, title, description, button, onClose } = props

  return (
    <div
      className={classNames(
        'flex flex-col sm:flex-row justify-between items-center w-full p-2 md:p-4 md:pr-8 gap-4 mb-1',
        'relative isolate overflow-hidden rounded-base bg-surface-dark',
      )}
    >
      {onClose && (
        <div className='absolute top-0 right-1'>
          <Button
            variant='transparent'
            color='quaternary'
            onClick={onClose}
            leftIcon={<Cross />}
            className='!p-1.5'
            iconClassName='w-3 h-3'
          />
        </div>
      )}
      <div className='flex items-center gap-2 md:gap-4'>
        {asset && <AssetImage asset={asset} className='w-16 h-16 sm:w-10 sm:h-10' />}
        <div className='space-y-1 md:space-y-2'>
          <Text size='sm' className={classNames(onClose && 'pr-5')}>
            {title}
          </Text>
          <Text size='xs' className='text-white/50'>
            {description}
          </Text>
        </div>
      </div>
      {button}
    </div>
  )
}
