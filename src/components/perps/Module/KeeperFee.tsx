import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function KeeperFee() {
  const chainConfig = useChainConfig()
  const creditManagerConfig = useStore((s) => s.creditManagerConfig)

  const defaultKeeperFee = JSON.stringify(
    creditManagerConfig?.keeper_fee_config?.min_fee ?? {
      denom: '',
      amount: '0',
    },
  )

  const [keeperFee] = useLocalStorage(LocalStorageKeys.PERPS_KEEPER_FEE, defaultKeeperFee)

  const parsedKeeperFee = useMemo(() => {
    try {
      return typeof keeperFee === 'string' ? JSON.parse(keeperFee) : keeperFee
    } catch {
      return { denom: '', amount: '0' }
    }
  }, [keeperFee])

  if (!parsedKeeperFee || !chainConfig.perps) return null

  return (
    <div className='flex flex-col w-full border rounded bg-white/5 border-white/20'>
      <div className='flex gap-1 px-3 py-4 align-center'>
        <Text size='xs' className='flex flex-grow font-bold'>
          Keeper Fee
        </Text>
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(parsedKeeperFee.denom, BN(parsedKeeperFee.amount))}
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
