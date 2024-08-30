import Background from 'components/common/Background'
import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { useState } from 'react'

export default function ErrorPage() {
  const [clicked, setClicked] = useState(false)
  const onButtonClick = () => {
    setClicked(true)
    localStorage.clear()
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  return (
    <>
      <Background />
      <main className='relative z-20 w-full'>
        <div className='flex flex-wrap justify-center w-full gap-6 p-20'>
          <Text size='4xl' className='w-full text-center'>
            An error occured!
          </Text>
          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            The Mars Protocol app encountered an error. <br />
            Please click the button below to reset your local storage, as this is the most common
            issue when the app is crashing.
            <br />
            If this doesn't solve your problem, please contact a moderator on{' '}
            <TextLink
              href='https://discord.marsprotocol.io'
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='Mars Protocol Discord'
            >
              Discord
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>{' '}
            or{' '}
            <TextLink
              href='https://telegram.marsprotocol.io'
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='Mars Protocol Telegram'
            >
              Telegram
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>
          </Text>
          <Button
            onClick={onButtonClick}
            className='min-w-[150px]'
            text='Reset Local Storage'
            color='secondary'
            showProgressIndicator={clicked}
          />
        </div>
      </main>
    </>
  )
}
