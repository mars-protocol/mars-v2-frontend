import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function KeeperFee() {
  const chainConfig = useChainConfig()
  const [keeperFee] = useLocalStorage<Coin>(
    LocalStorageKeys.PERPS_KEEPER_FEE,
    getDefaultChainSettings(chainConfig).perpsKeeperFee,
  )

  if (!keeperFee) return
  return (
    <div className='flex flex-col w-full border rounded bg-white/5 border-white/20'>
      <div className='flex gap-1 px-3 py-4 align-center'>
        <Text size='xs' className='flex flex-grow font-bold'>
          Keeper Fee
        </Text>
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(keeperFee.denom, BN(keeperFee.amount).div(100))}
          className='flex text-xs text-white/40'
        />
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
