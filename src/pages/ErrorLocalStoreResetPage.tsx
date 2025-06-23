import Background from 'components/common/Background'
import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { useState } from 'react'

export default function ErrorLocalStoreResetPage() {
  const [clicked, setClicked] = useState(false)
  const onResetButtonClick = () => {
    localStorage.clear()
    refresh()
  }

  const refresh = () => {
    setClicked(true)
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
            An error occurred!
          </Text>
          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            The Mars Protocol app encountered an error. <br />
            Please try to refresh the page. If you get here again try resetting your local storage by
            clicking on the button below. This will ensure your local browser store isn't corrupted.
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
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <Button
              onClick={refresh}
              className='min-w-[150px]'
              text='Reload Page'
              color='primary'
              showProgressIndicator={clicked}
            />
            <Button
              onClick={onResetButtonClick}
              className='min-w-[150px]'
              text='Reset Local Storage'
              color='secondary'
              showProgressIndicator={clicked}
            />
          </div>
        </div>
      </main>
    </>
  )
}
