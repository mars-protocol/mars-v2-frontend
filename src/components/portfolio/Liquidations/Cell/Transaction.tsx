import Text from 'components/common/Text'
import { ExternalLink } from 'components/common/Icons'
import { truncate } from 'utils/formatters'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import { ChainInfoID } from 'types/enums'
import { TextLink } from 'components/common/TextLink'

interface Props {
  value: string
}

export default function Transaction(props: Props) {
  const { value } = props

  const chainId = getCurrentChainId()

  const url =
    chainId === ChainInfoID.Osmosis1
      ? `https://www.mintscan.io/osmosis/txs/${value}`
      : `https://www.mintscan.io/neutron/txs/${value}`

  return (
    <div
      className='flex items-center justify-end gap-2'
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Text size='sm'> {truncate(value, [5, 5])}</Text>
      <TextLink href={url} target='_blank' title={`View transaction ${value} on Mintscan`}>
        <ExternalLink className='w-3.5 h-3.5 text-white/40 hover:text-inherit hover:cursor-pointer' />
      </TextLink>
    </div>
  )
}
