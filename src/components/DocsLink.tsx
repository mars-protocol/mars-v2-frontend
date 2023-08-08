import { ExternalLink } from 'components/Icons'
import Text from 'components/Text'
import { TextLink } from 'components/TextLink'
import { DocURL } from 'types/enums/docURL'

interface Props {
  type: DocLinkType
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
    <Text size='sm' className='w-full pt-3 text-center text-white/60'>
      {`${intro} `}
      <TextLink
        href={url}
        target='_blank'
        className='leading-4 text-white hover:underline'
        title={linkText}
      >
        {linkText}
        <ExternalLink className='-mt-1 ml-1 inline w-3.5' />
      </TextLink>
    </Text>
  )
}
