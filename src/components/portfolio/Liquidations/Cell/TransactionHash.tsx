import Text from 'components/common/Text'
import { ExternalLink } from 'components/common/Icons'
import { truncate } from 'utils/formatters'
import { TextLink } from 'components/common/TextLink'
import useChainConfig from 'hooks/chain/useChainConfig'

interface Props {
  txHash: string
}

export default function TransactionHash(props: Props) {
  const { txHash } = props
  const chainConfig = useChainConfig()
  const url = `${chainConfig.endpoints.explorer}/txs/${txHash}`

  return (
    <div
      className='flex items-center justify-end gap-2'
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Text size='sm'> {truncate(txHash, [5, 5])}</Text>
      <TextLink href={url} target='_blank' title={`View transaction ${txHash} on Mintscan`}>
        <div className='w-3.5 h-3.5 text-white/40 hover:text-martian-red'>
          <ExternalLink />
        </div>
      </TextLink>
    </div>
  )
}
