import { ExternalLink } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  type: 'wallet' | 'account'
}

export default function WalletTutorial({ type }: Props) {
  const text = type === 'wallet' ? 'New with wallets?' : 'Why mint your account?'
  const url =
    type === 'wallet'
      ? 'https://docs.marsprotocol.io/docs/learn/workstation/basics/basics-intro'
      : 'https://docs.marsprotocol.io/docs/learn/workstation/rover/rover-intro'

  return (
    <Text size='sm' className='w-full pt-3 text-center text-white/60'>
      {`${text} `}
      <a href={url} target='_blank' className='leading-4 text-white hover:underline'>
        Learn more
        <ExternalLink className='-mt-1 ml-1 inline w-3.5' />
      </a>
    </Text>
  )
}
