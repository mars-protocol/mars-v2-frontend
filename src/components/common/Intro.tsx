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
  bg: 'borrow' | 'lend' | 'farm' | 'portfolio' | 'hls-farm' | 'hls-staking'
}

function IntroBackground(props: { bg: Props['bg'] }) {
  switch (props.bg) {
    case 'borrow':
      return <GridHole className='h-55 opacity-5' />
    case 'lend':
      return <GridTire className='h-55 opacity-5' />
    case 'farm':
      return <GridLandscape className='h-55 opacity-5' />
    case 'hls-farm':
      return <GridWeb className='h-45 opacity-5' />
    case 'hls-staking':
      return <GridPlanet className='h-55 opacity-10' />
    default:
      return <GridGlobe className='h-50 opacity-5' />
  }
}

export default function Intro(props: Props) {
  const showTutorial = useStore((s) => s.tutorial)
  const isHLS = useStore((s) => s.isHLS)
  if (!showTutorial) return null
  return (
    <Card
      className={classNames(
        'relative w-full p-8 bg-cover h-55',
        isHLS ? 'bg-intro-hls' : 'bg-intro',
      )}
      contentClassName='flex w-full h-full flex-col justify-between'
    >
      <div className='absolute inset-0 flex items-end justify-end w-full h-full text-white'>
        <IntroBackground bg={props.bg} />
      </div>
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
      <div className='flex w-full'>
        <Text size='lg' className='max-w-full leading-7 w-140 text-white/60'>
          {props.text}
        </Text>
      </div>
      {props.children && <div className='flex w-full gap-4'>{props.children}</div>}
    </Card>
  )
}
