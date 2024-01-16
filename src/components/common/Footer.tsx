import { TextLink } from 'components/common/TextLink'
import { DocURL } from 'types/enums/docURL'

import packageInfo from '../../../package.json'

export default function Footer() {
  const version = `v${packageInfo.version}`
  const flatVersion = packageInfo.version.split('.').join('')
  return (
    <footer className='flex items-center justify-center w-full h-6 -mt-6'>
      <div className='w-full px-4 pb-4 text-right'>
        <TextLink
          className='text-xs text-white opacity-50 hover:text-white hover:opacity-80'
          href={`${DocURL.CHANGE_LOG_URL}#release-v${flatVersion}`}
          target='_blank'
          title={`Mars Protocol ${version} change log`}
        >
          {version}
        </TextLink>
      </div>
    </footer>
  )
}
