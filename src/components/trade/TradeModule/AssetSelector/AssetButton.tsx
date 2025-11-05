import classNames from 'classnames'
import { isMobile } from 'react-device-detect'

import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'

interface Props {
  asset: Asset
  onClick: () => void
}

export default function AssetButton(props: Props) {
  return (
    <Button
      leftIcon={<AssetImage asset={props.asset} className='w-6 h-6' />}
      iconClassName='w-6 h-6'
      text={props.asset.symbol}
      color='tertiary'
      variant='transparent'
      className={classNames(
        isMobile ? 'px-2! text-sm' : 'md:text-base',
        'w-full border border-white/20',
      )}
      textClassNames='flex flex-1'
      size='md'
      hasSubmenu
      {...props}
    />
  )
}
