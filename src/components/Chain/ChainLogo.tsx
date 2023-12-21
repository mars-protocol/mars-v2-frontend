import { Neutron, Osmo } from 'components/Icons'
import { ChainInfoID } from 'types/enums/wallet'

interface Props {
  chainID: ChainInfoID
  className?: string
}

export default function ChainLogo(props: Props) {
  const { chainID, className } = props

  switch (chainID) {
    case ChainInfoID.Pion1:
      return <Neutron className={className} />

    default:
      return <Osmo className={className} />
  }
}
