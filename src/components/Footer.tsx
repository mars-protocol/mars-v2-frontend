import Text from 'components/Text'

import packageInfo from '../../package.json'

export default function Footer() {
  return (
    <footer className='flex items-center justify-center w-full h-6 -mt-6'>
      <div className='w-full px-4 pb-4 text-right'>
        <Text size='xs' className='opacity-50'>
          v{packageInfo.version}
        </Text>
      </div>
    </footer>
  )
}
