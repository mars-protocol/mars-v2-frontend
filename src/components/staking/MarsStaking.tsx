import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import MarsStakingModal from 'components/Modals/MarsStakingModal'
import { useStakedMars, useUnstakedMars } from 'hooks/staking/useNeutronStakingData'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import chains from 'chains'
import { ChainInfoID } from 'types/enums'
import { getRoute } from 'utils/route'
import { formatReleaseDate } from 'utils/dateTime'
import useStore from 'store'
import MarsProtocolLogo from 'components/common/Icons/Logo.svg'

export default function MarsStaking({ className }: { className?: string }) {
  const connectedAddress = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [_, setCurrentChainId] = useCurrentChainId()

  const { data: stakedMarsData } = useStakedMars()
  const { data: unstakedData } = useUnstakedMars()

  const stakedAmount = stakedMarsData?.stakedAmount || BN_ZERO

  const handleOpenManageModal = () => {
    useStore.setState({ marsStakingModal: { type: 'stake' } })
  }

  const handleSwitchToNeutron = useCallback(async () => {
    const neutronChainConfig = chains[ChainInfoID.Neutron1]
    setCurrentChainId(neutronChainConfig.id)
    mutate(() => true)
    useStore.setState({
      assets: [],
      mobileNavExpanded: false,
      chainConfig: neutronChainConfig,
      isV1: false,
      client: undefined,
      address: undefined,
      userDomain: undefined,
      balances: [],
    })
    navigate(getRoute('portfolio', searchParams))
  }, [setCurrentChainId, mutate, navigate, searchParams])

  const renderActionButton = () => {
    if (!connectedAddress) {
      return (
        <WalletConnectButton
          className='w-full'
          color='primary'
          size='md'
          textOverride='Connect Wallet to Stake MARS'
        />
      )
    }

    if (chainConfig.isOsmosis) {
      return (
        <div className='space-y-3'>
          <div className='p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
            <Text size='sm' className='text-warning text-center'>
              MARS staking is only available on Neutron network.
            </Text>
          </div>
          <Button
            color='primary'
            size='md'
            text='Switch to Neutron'
            onClick={handleSwitchToNeutron}
            className='w-full'
          />
        </div>
      )
    }

    return (
      <Button
        color='primary'
        size='md'
        text='Manage your MARS stake'
        onClick={handleOpenManageModal}
        className='w-full'
      />
    )
  }

  return (
    <>
      <Card
        className={className}
        title={
          <div className='flex items-center gap-2 flex w-full p-4 font-semibold bg-white/10'>
            <MarsProtocolLogo className='w-6 h-6' />
            <Text size='lg' className=''>
              MARS Staking
            </Text>
          </div>
        }
        contentClassName='px-4 py-2 space-y-6'
      >
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <Text size='sm' className='text-white/60'>
              Currently Staked
            </Text>
            <FormattedNumber
              amount={stakedAmount?.toNumber() || 0}
              options={{ abbreviated: true, suffix: ' MARS' }}
              className='text-sm font-medium'
            />
          </div>

          {unstakedData?.totalUnstaked?.gt(0) && (
            <div className='flex justify-between items-center'>
              <Text size='sm' className='text-white/60'>
                Unstaking
              </Text>
              <FormattedNumber
                amount={unstakedData.totalUnstaked.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm font-medium text-warning'
              />
            </div>
          )}

          {unstakedData?.totalReady?.gt(0) && (
            <div className='flex justify-between items-center'>
              <Text size='sm' className='text-white/60'>
                Ready to Withdraw
              </Text>
              <FormattedNumber
                amount={unstakedData.totalReady.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm font-medium text-success'
              />
            </div>
          )}

          {unstakedData?.nextReleaseTime && (
            <div className='flex justify-between items-center'>
              <Text size='sm' className='text-white/60'>
                Next Available
              </Text>
              <Text size='sm' className='text-white/80'>
                {formatReleaseDate(unstakedData.nextReleaseTime)}
              </Text>
            </div>
          )}
        </div>

        {renderActionButton()}
      </Card>

      {connectedAddress && <MarsStakingModal />}
    </>
  )
}
