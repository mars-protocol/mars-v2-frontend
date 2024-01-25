import Card from 'components/common/Card'
import { Cross, ExclamationMarkCircled } from 'components/common/Icons'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { DocURL } from 'types/enums/docURL'

export default function MigrationBanner() {
  const [_, setMigrationBanner] = useLocalStorage<boolean>(
    LocalStorageKeys.MIGRATION_BANNER,
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
          href={DocURL.V1_URL}
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