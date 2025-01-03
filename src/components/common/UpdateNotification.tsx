import { useEffect, useState } from 'react'
import NotificationBanner from 'components/common/NotificationBanner'
import Button from 'components/common/Button'
import packageInfo from '../../../package.json'
import { ArrowCircle } from 'components/common/Icons'

export default function UpdateNotification() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/mars-protocol/mars-v2-frontend/main/package.json',
        )
        const data = await response.json()
        const latestVersion = data.version

        if (latestVersion !== packageInfo.version) {
          setIsUpdateAvailable(true)
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }

    const intervalId = setInterval(checkForUpdates, 600000)

    checkForUpdates()

    return () => clearInterval(intervalId)
  }, [])

  if (!isUpdateAvailable) return null

  return (
    <div className='absolute top-[73px] left-1/2 transform -translate-x-1/2 flex items-center justify-center z-50 pt-2'>
      <NotificationBanner
        type='info'
        text='A new version is available.'
        button={
          <Button
            color='tertiary'
            onClick={() => window.location.reload()}
            text='Refresh to Update'
            rightIcon={<ArrowCircle />}
            iconClassName='text-info w-4 h-4'
          >
            Refresh
          </Button>
        }
      />
    </div>
  )
}
