import classNames from 'classnames'

import { DocURL } from 'types/enums'
import { ExternalLink } from './Icons'
import Text from './Text'
import { TextLink } from './TextLink'

interface Props {
  type: DocLinkType
  className?: string
}

function getData(type: string) {
  if (type === 'account') return ['Why mint your account?', 'Learn more', DocURL.ROVER_INTRO_URL]
  if (type === 'fund') return ['Why fund your account?', 'Learn more', DocURL.MANAGE_ACCOUNT_URL]
  if (type === 'wallet') return ['New with wallets?', 'Learn more', DocURL.WALLET_INTRO_URL]
  return ['By continuing you accept our', 'terms of service', DocURL.TERMS_OF_SERVICE_URL]
}

export default function DocsLink(props: Props) {
  const [intro, linkText, url] = getData(props.type)

  return (
    <Text
      size='sm'
      className={classNames('w-full pt-3 text-center text-white/60', props.className)}
    >
      {`${intro} `}
      <TextLink
        href={url}
        target='_blank'
        className={classNames('ml-1 leading-4 text-white hover:underline', props.className)}
        title={linkText}
      >
        {linkText}
        <ExternalLink className='ml-1 inline w-3.5' />
      </TextLink>
    </Text>
  )
}
