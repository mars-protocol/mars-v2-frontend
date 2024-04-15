import { ChainInfoID } from 'types/enums'
import { Neutron, Osmo } from 'components/common/Icons'

interface Props {
  chainID: ChainInfoID
  className?: string
}

export default function ChainLogo(props: Props) {
  const { chainID, className } = props

  switch (chainID) {
    case ChainInfoID.Pion1:
    case ChainInfoID.Neutron1:
      return <Neutron className={className} />

    default:
      return <Osmo className={className} />
  }
}
