import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import useChainConfig from 'hooks/chain/useChainConfig'
import useKeeperFee from 'hooks/perps/useKeeperFee'
import useStore from 'store'

export default function KeeperFee() {
  const chainConfig = useChainConfig()
  const { calculateKeeperFee } = useKeeperFee()

  if (!calculateKeeperFee || !chainConfig.perps) return null

  return (
    <div className='flex flex-col w-full border rounded bg-white/5 border-white/20'>
      <div className='flex gap-1 px-3 py-4 align-center'>
        <Text size='xs' className='flex flex-grow font-bold'>
          Keeper Fee
        </Text>
        <DisplayCurrency coin={calculateKeeperFee} className='flex text-xs text-white/40' />
        <Button
          text='Edit'
          className='!py-0 !pr-0 ml-2 text-xs border-l border-white/20 !text-martian-red hover:!text-mars !min-h-0'
          variant='transparent'
          color='quaternary'
          onClick={() => useStore.setState({ keeperFeeModal: true })}
        />
      </div>
    </div>
  )
}
