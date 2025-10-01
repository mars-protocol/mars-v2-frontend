import chains from 'chains'
import classNames from 'classnames'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ChevronDown, ChevronRight, MarsToken } from 'components/common/Icons'
import Text from 'components/common/Text'
import TierProgressBar from 'components/staking/TierProgressBar'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useStakedMars, useUnstakedMars } from 'hooks/staking/useNeutronStakingData'
import { useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { useSWRConfig } from 'swr'
import { ChainInfoID } from 'types/enums'
import { MARS_DECIMALS } from 'utils/constants'
import { formatReleaseDate } from 'utils/dateTime'
import { getRoute } from 'utils/route'

export default function MarsStaking({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>(
    LocalStorageKeys.MARS_STAKING_EXPANDED,
    true,
  )
  const { address: urlAddress } = useParams()
  const connectedAddress = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [_, setCurrentChainId] = useCurrentChainId()

  const displayAddress = urlAddress ?? connectedAddress
  const isOwnWallet = !urlAddress || urlAddress === connectedAddress

  const { data: stakedMarsData } = useStakedMars(displayAddress)
  const { data: unstakedData } = useUnstakedMars(displayAddress)

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
    if (!isOwnWallet) {
      return null
    }

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
        className={classNames(className, 'bg-surface')}
        title={
          <div
            className='flex items-center gap-3 w-full p-4 font-semibold bg-card-bg cursor-pointer hover:bg-surface transition-colors rounded-t-lg'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <MarsToken className='w-6 h-6 text-primary' />
            <Text size='lg' className='flex-1 font-semibold'>
              MARS Staking
            </Text>
            {isExpanded ? (
              <ChevronDown className='w-5 h-5 text-white/60' />
            ) : (
              <ChevronRight className='w-5 h-5 text-white/60' />
            )}
          </div>
        }
        contentClassName=''
      >
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className='overflow-hidden'>
            <div className='p-6 space-y-6'>
              {(connectedAddress || displayAddress) && (
                <div className='mb-4'>
                  <TierProgressBar connected={!!connectedAddress} />
                </div>
              )}

              <div className='space-y-4'>
                <div className='flex justify-between items-center py-2 border-b border-white/10'>
                  <Text size='sm' className='text-white/80 font-medium'>
                    Currently Staked
                  </Text>
                  <FormattedNumber
                    amount={stakedAmount?.toNumber() || 0}
                    options={{ abbreviated: false, suffix: ' MARS', maxDecimals: MARS_DECIMALS }}
                    className='text-sm font-semibold text-white'
                  />
                </div>

                {unstakedData?.totalUnstaked?.gt(0) && (
                  <div className='flex justify-between items-center py-2 border-b border-white/10'>
                    <Text size='sm' className='text-white/80 font-medium'>
                      Unstaking
                    </Text>
                    <FormattedNumber
                      amount={unstakedData.totalUnstaked.toNumber()}
                      options={{ abbreviated: false, suffix: ' MARS', maxDecimals: MARS_DECIMALS }}
                      className='text-sm font-semibold text-warning'
                    />
                  </div>
                )}

                {unstakedData?.totalReady?.gt(0) && (
                  <div className='flex justify-between items-center py-2 border-b border-white/10'>
                    <Text size='sm' className='text-white/80 font-medium'>
                      Ready to Withdraw
                    </Text>
                    <FormattedNumber
                      amount={unstakedData.totalReady.toNumber()}
                      options={{ abbreviated: false, suffix: ' MARS', maxDecimals: MARS_DECIMALS }}
                      className='text-sm font-semibold text-success'
                    />
                  </div>
                )}

                {unstakedData?.nextReleaseTime && (
                  <div className='flex justify-between items-center py-2 border-b border-white/10'>
                    <Text size='sm' className='text-white/80 font-medium'>
                      Next Available
                    </Text>
                    <Text size='sm' className='font-semibold text-white'>
                      {formatReleaseDate(unstakedData.nextReleaseTime)}
                    </Text>
                  </div>
                )}
              </div>

              <div className='pt-2'>{renderActionButton()}</div>

              <Callout type={CalloutType.INFO}>
                If you want to learn more about the Mars Staking Tiers, you can find the details on
                our{' '}
                <a
                  className='underline hover:no-underline text-primary'
                  href='https://docs.marsprotocol.io/governance/mars-staking'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  MARS Staking Docs Page
                </a>
                .
              </Callout>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
