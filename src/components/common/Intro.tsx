import classNames from 'classnames'
import { ReactNode } from 'react'

import Card from 'components/common/Card'
import {
  GridGlobe,
  GridHole,
  GridLandscape,
  GridPlanet,
  GridTire,
  GridWeb,
  PerpsVault,
} from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useStore from 'store'

interface Props {
  text: string | ReactNode
  children?: ReactNode
  bg: Page
  isCompact?: boolean
}

function IntroBackground(props: { bg: Props['bg'] }) {
  switch (props.bg) {
    case 'borrow':
      return (
        <div className='absolute top-0 right-0 block w-140 opacity-5'>
          <GridHole />
        </div>
      )
    case 'lend':
    case 'vaults':
      return (
        <div className='absolute top-0 right-0 block w-180 opacity-5'>
          <GridTire />
        </div>
      )
    case 'farm':
      return (
        <div className='absolute top-0 right-0 block w-140 opacity-5'>
          <GridLandscape />
        </div>
      )
    case 'hls-farm':
      return (
        <div className='absolute bottom-0 right-0 block w-140 opacity-10'>
          <GridWeb />
        </div>
      )
    case 'hls-staking':
      return (
        <div className='absolute top-0 right-0 block w-110 opacity-10'>
          <GridPlanet />
        </div>
      )
    case 'perps-vault':
      return (
        <div className='absolute -top-8 right-0 block w-120 opacity-40'>
          <PerpsVault />
        </div>
      )
    default:
      return (
        <div className='absolute bottom-0 right-0 block w-3/4 md:w-120 opacity-5'>
          <GridGlobe />
        </div>
      )
  }
}

export default function Intro(props: Props) {
  const showTutorial = useStore((s) => s.tutorial)
  const isHls = useStore((s) => s.isHls)

  if (!showTutorial && !props.isCompact) return null

  return (
    <Card
      className={classNames(
        'relative w-full bg-cover',
        props.isCompact ? 'md:h-16' : 'md:h-24 min-h-24',
      )}
      contentClassName='flex w-full h-full flex-col justify-between p-2'
    >
      <div className='absolute inset-0 w-full h-full overflow-hidden text-white'>
        <IntroBackground bg={props.bg} />
      </div>
      {showTutorial && !props.isCompact && (
        <Tooltip
          className='absolute top-4 right-4'
          type='info'
          content={
            <Text size='xs'>
              If you want to hide these info boxes. Set the <strong>Tutorial</strong> to OFF in the
              Settings.
            </Text>
          }
        />
      )}
      <div className='flex w-full'>
        <Text size='xs' className='max-w-full leading-4 w-140 text-white/60'>
          {props.text}
        </Text>
      </div>
      {props.children && (
        <div
          className={classNames(
            'flex flex-wrap w-full gap-1 pt-1 md:flex-nowrap md:pt-0',
            props.isCompact && 'justify-end',
          )}
        >
          {props.children}
        </div>
      )}
    </Card>
  )
}
