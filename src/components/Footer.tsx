import Text from 'components/Text'

import packageInfo from '../../package.json'

export default function Footer() {
  return (
    <footer className='flex h-6 w-full items-center justify-center'>
      <div className='w-full max-w-screen-lg text-right'>
        <Text size='xs' className='opacity-50'>
          v{packageInfo.version}
        </Text>
      </div>
    </footer>
  )
}
