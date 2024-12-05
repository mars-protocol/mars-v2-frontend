import Background from 'components/common/Background'
import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { useState } from 'react'
import useStore from 'store'

export default function ErrorApiPage() {
  const [clicked, setClicked] = useState(false)
  const apiError = useStore((s) => s.errorStore).apiError

  const refresh = () => {
    setClicked(true)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  if (!apiError) return null

  return (
    <>
      <Background />
      <main className='relative z-20 w-full'>
        <div className='flex flex-wrap justify-center w-full gap-6 p-20'>
          <Text size='4xl' className='w-full text-center'>
            Failed to fetch mandatory data
          </Text>

          <Text size='sm' className='w-full leading-4 text-center text-white'>
            The app wasn't able to fetch the API:{' '}
            <TextLink
              href={apiError.api}
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='API Endpoint'
            >
              {apiError.api}
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>
          </Text>
          <Text size='sm' className='w-full italic leading-4 text-center text-martian-red'>
            Reason: {apiError.message}
          </Text>
          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            Data provided by this endpoint is mandatory and the app won't work without it.
          </Text>

          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            Please try to refresh the page.
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
          </div>
        </div>
      </main>
    </>
  )
}
