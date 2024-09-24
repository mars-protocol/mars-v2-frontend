import classNames from 'classnames'
import Text from 'components/common/Text'
import React from 'react'
import AssetImage from 'components/common/assets/AssetImage'

interface Props {
  asset?: Asset
  title: React.ReactNode
  description: string
  button: React.ReactNode
}

export default function Banner(props: Props) {
  const { asset, title, description, button } = props

  return (
    <div
      className={classNames(
        'flex justify-between items-center w-full px-8 bg-white/10 mb-4 h-20',
        'relative isolate overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      <div
        className={classNames(
          'absolute h-[20vw] w-[40vw] bottom-[0] right-[-10vw] rounded-full opacity-30',
          'blur-orb-secondary bg-purple',
        )}
      />
      <div className='flex gap-4 items-center'>
        {asset && <AssetImage asset={asset} className='w-10 h-10' />}
        <div className='space-y-2'>
          <Text size='sm'>{title}</Text>
          <Text size='xs' className='text-white/50'>
            {description}
          </Text>
        </div>
      </div>
      {button}
    </div>
  )
}
