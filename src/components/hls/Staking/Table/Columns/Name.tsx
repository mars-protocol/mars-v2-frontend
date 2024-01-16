import DoubleLogo from 'components/common/DoubleLogo'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAsset from 'hooks/assets/useAsset'

export const NAME_META = { id: 'name', header: 'Strategy' }
interface Props {
  strategy: HLSStrategy
}

export default function Name(props: Props) {
  const { strategy } = props
  const depositAsset = useAsset(props.strategy.denoms.deposit)
  const borrowAsset = useAsset(props.strategy.denoms.borrow)

  return (
    <div className='flex'>
      <DoubleLogo primaryDenom={strategy.denoms.deposit} secondaryDenom={strategy.denoms.borrow} />
      {depositAsset && borrowAsset ? (
        <TitleAndSubCell
          className='ml-2 mr-2 text-left'
          title={`${depositAsset.symbol} - ${borrowAsset.symbol}`}
          sub='Via Mars Protocol'
        />
      ) : (
        <Loading />
      )}
    </div>
  )
}
