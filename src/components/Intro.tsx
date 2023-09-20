import { ReactNode } from 'react'

import Card from 'components/Card'
import { GridGlobe, GridHole, GridLandscape, GridTire } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { TUTORIAL_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  text: string | ReactNode
  children?: ReactNode
  bg: 'borrow' | 'lend' | 'farm' | 'portfolio'
}

function IntroBackground(props: { bg: Props['bg'] }) {
  switch (props.bg) {
    case 'borrow':
      return <GridHole className='h-55' />
    case 'lend':
      return <GridTire className='h-55' />
    case 'farm':
      return <GridLandscape className='h-55' />
    default:
      return <GridGlobe className='h-50' />
  }
}

export default function Intro(props: Props) {
  const [tutorial] = useLocalStorage<boolean>(TUTORIAL_KEY, DEFAULT_SETTINGS.tutorial)

  if (!tutorial) return null
  return (
    <Card
      className={`relative w-full p-8 bg-intro bg-cover h-55`}
      contentClassName='flex w-full h-full flex-col justify-between'
    >
      <div className='absolute inset-0 flex items-end justify-end w-full h-full text-white opacity-5'>
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
