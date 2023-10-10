import Card from 'components/Card'
import { Cross, ExclamationMarkCircled } from 'components/Icons'
import Text from 'components/Text'
import { TextLink } from 'components/TextLink'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { MIGRATION_BANNER_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

export default function MigrationBanner() {
  const [_, setMigrationBanner] = useLocalStorage<boolean>(
    MIGRATION_BANNER_KEY,
    DEFAULT_SETTINGS.migrationBanner,
  )

  const showMigrationBanner = useStore((s) => s.migrationBanner)

  if (!showMigrationBanner) return null
  return (
    <Card
      className='relative w-full bg-info-bg/20 text-info'
      contentClassName='flex w-full gap-2 px-4 py-3 items-center'
    >
      <div className='flex w-6 h-6 p-1 text-white rounded bg-info'>
        <ExclamationMarkCircled />
      </div>
      <Text className='flex flex-grow' size='sm'>
        If you have funds on{' '}
        <TextLink
          href='https://v1.marsprotocol.io'
          externalLink
          className='mx-1 text-white no-underline hover:underline'
        >
          Mars v1,
        </TextLink>
        please withdraw them and deposit them on Mars v2 to migrate.
      </Text>
      <div
        className='absolute right-0 flex items-center h-full px-4 w-11 opacity-80 hover:cursor-pointer hover:opacity-100'
        onClick={() => setMigrationBanner(false)}
      >
        <Cross className='w-3 h-3' />
      </div>
    </Card>
  )
}
