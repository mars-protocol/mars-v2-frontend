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
        'relative w-full bg-surface-dark',
        props.isCompact ? 'md:h-32' : 'md:h-48 min-h-48',
      )}
      contentClassName='flex w-full h-full flex-col justify-between p-6'
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
        <Text size='base' className='max-w-full leading-6 w-140 text-white/80'>
          {props.text}
        </Text>
      </div>
      {props.children && (
        <div
          className={classNames(
            'flex flex-wrap w-full gap-3 pt-4 md:flex-nowrap md:pt-0',
            props.isCompact && 'justify-end',
          )}
        >
          {props.children}
        </div>
      )}
    </Card>
  )
}
