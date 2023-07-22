import { ExternalLink } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  type: 'wallet' | 'account' | 'terms'
}

function getData(type: string) {
  if (type === 'wallet')
    return [
      'New with wallets?',
      'Learn more',
      'https://docs.marsprotocol.io/docs/learn/workstation/basics/basics-intro',
    ]
  if (type === 'account')
    return [
      'Why mint your account?',
      'Learn more',
      'https://docs.marsprotocol.io/docs/learn/workstation/rover/rover-intro',
    ]
  return [
    'By continuing you accept our',
    'terms of service',
    'https://docs.marsprotocol.io/docs/overview/legal/terms-of-service',
  ]
}

export default function DocsLink(props: Props) {
  const [intro, linkText, url] = getData(props.type)

  return (
    <Text size='sm' className='w-full pt-3 text-center text-white/60'>
      {`${intro} `}
      <a href={url} target='_blank' className='leading-4 text-white hover:underline'>
        {linkText}
        <ExternalLink className='-mt-1 ml-1 inline w-3.5' />
      </a>
    </Text>
  )
}
