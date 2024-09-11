import { DocURL } from '../../types/enums'
import { TextLink } from './TextLink'

import packageInfo from '../../../package.json'

export default function Footer() {
  const version = `v${packageInfo.version}`
  return (
    <footer className='flex items-center justify-center w-full h-6 -mt-6'>
      <div className='w-full p-2 pt-0 text-right md:p-4'>
        <TextLink
          className='text-xs text-white opacity-50 hover:text-white hover:opacity-80'
          href={`${DocURL.FEATURE_URL}${version}`}
          target='_blank'
          title={`Mars Protocol ${version} change log`}
        >
          {version}
        </TextLink>
      </div>
    </footer>
  )
}
