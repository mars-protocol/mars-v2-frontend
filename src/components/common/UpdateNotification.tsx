import Button from 'components/common/Button'
import { ArrowCircle } from 'components/common/Icons'
import NotificationBanner from 'components/common/NotificationBanner'
import { useEffect, useState } from 'react'
import useStore from 'store'
import packageInfo from '../../../package.json'

export default function UpdateNotification() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const focusComponent = useStore((s) => s.focusComponent)

  useEffect(() => {
    const currentUrl = window ? window.location.href : ''
    async function checkForUpdates() {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/mars-protocol/mars-v2-frontend/main/package.json',
        )
        const data = await response.json()
        const latestVersion = data.version

        if (latestVersion !== packageInfo.version && currentUrl.includes('marsprotocol.io')) {
          setIsUpdateAvailable(true)
        }
        if (focusComponent !== null) {
          setIsUpdateAvailable(false)
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }

    const intervalId = setInterval(checkForUpdates, 600000)

    checkForUpdates()

    return () => clearInterval(intervalId)
  }, [focusComponent])

  if (!isUpdateAvailable) return null

  return (
    <div className='w-full mt-[73px] -mb-[93px] p-4'>
      <NotificationBanner
        type='info'
        text='A new version is available. Reload the app to update.'
        button={
          <Button
            color='tertiary'
            onClick={() => window.location.reload()}
            text='Refresh to Update'
            rightIcon={<ArrowCircle />}
            iconClassName='w-4 h-4'
          >
            Reload
          </Button>
        }
      />
    </div>
  )
}
