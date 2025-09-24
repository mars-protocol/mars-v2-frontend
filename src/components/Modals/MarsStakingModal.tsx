import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import { FormattedNumber } from 'components/common/FormattedNumber'
import SwitchWithText from 'components/common/Switch/SwitchWithText'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import Modal from 'components/Modals/Modal'
import TierLabel from 'components/staking/TierLabel'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAsset from 'hooks/assets/useAsset'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { useStakedMars, useUnstakedMars } from 'hooks/staking/useNeutronStakingData'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { MARS_DECIMALS, MARS_DENOM } from 'utils/constants'
import { formatReleaseDate } from 'utils/dateTime'
import { BN } from 'utils/helpers'

export default function MarsStakingModal() {
  const { marsStakingModal: modal } = useStore()
  const { address: urlAddress } = useParams()
  const connectedAddress = useStore((s) => s.address)
  const [amount, setAmount] = useState(BN_ZERO)
  const [isLoading, setIsLoading] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [modalType, setModalType] = useState<'stake' | 'unstake'>('stake')

  const displayAddress = urlAddress ?? connectedAddress

  const { data: stakedMarsData } = useStakedMars(displayAddress)
  const { data: unstakedData } = useUnstakedMars(displayAddress)
  const stakeMars = useStore((s) => s.stakeMars)
  const unstakeMars = useStore((s) => s.unstakeMars)
  const withdrawMars = useStore((s) => s.withdrawMars)

  const stakedAmount = stakedMarsData?.stakedAmount || BN_ZERO
  const walletBalanceRaw = useCurrentWalletBalance(MARS_DENOM)
  const walletBalance = walletBalanceRaw
    ? BN(walletBalanceRaw.amount).shiftedBy(-MARS_DECIMALS)
    : BN_ZERO

  const marsAsset = useAsset(MARS_DENOM)

  // Selected Credit Account and withdrawable amount
  const account = useCurrentAccount()
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const accountDeposit = account?.deposits.find((c) => c.denom === MARS_DENOM)?.amount || BN_ZERO
  const rawAccountLent = account?.lends.find((c) => c.denom === MARS_DENOM)?.amount || BN_ZERO
  const isBorrowEnabled = !!marsAsset?.isBorrowEnabled
  const accountLent = isBorrowEnabled ? rawAccountLent : BN_ZERO
  const accountBalance = useMemo(
    () => accountDeposit.plus(accountLent).shiftedBy(-MARS_DECIMALS),
    [accountDeposit, accountLent],
  )
  const accountAvailable = useMemo(() => {
    if (!account) return BN_ZERO
    return computeMaxWithdrawAmount(MARS_DENOM).shiftedBy(-MARS_DECIMALS)
  }, [account, computeMaxWithdrawAmount])

  const maxAmount = useMemo(() => {
    if (!modal) return BN_ZERO
    return modalType === 'stake' ? walletBalance.plus(accountAvailable) : stakedAmount
  }, [modal, modalType, walletBalance, stakedAmount, accountAvailable])

  const handleAmountChange = useCallback((newAmount: BigNumber) => {
    setAmount(newAmount.shiftedBy(-MARS_DECIMALS))
  }, [])

  const actualAmount = useMemo(() => {
    return amount.shiftedBy(MARS_DECIMALS)
  }, [amount])

  const isValidAmount = useMemo(() => {
    return amount.gt(0) && amount.lte(maxAmount)
  }, [amount, maxAmount])

  const newStakedAmount = useMemo(() => {
    if (!modal || amount.isZero()) return stakedAmount
    if (modalType === 'stake') {
      return stakedAmount.plus(amount)
    } else {
      return stakedAmount.minus(amount)
    }
  }, [modal, modalType, stakedAmount, amount])

  const handleSubmit = useCallback(async () => {
    if (!isValidAmount || !modal) return

    setIsLoading(true)

    useStore.setState({ marsStakingModal: null })

    try {
      if (modalType === 'stake') {
        const stakingAmount = BNCoin.fromDenomAndBigNumber(MARS_DENOM, actualAmount)
        const shortfall = amount.minus(walletBalance)
        const shouldWithdrawFromAccount = !!account && shortfall.isGreaterThan(0)

        if (shouldWithdrawFromAccount) {
          const withdrawAmount = BNCoin.fromDenomAndBigNumber(
            MARS_DENOM,
            shortfall.shiftedBy(MARS_DECIMALS),
          )

          await stakeMars(
            stakingAmount as any,
            {
              withdrawFromAccount: {
                accountId: account.id,
                amount: withdrawAmount,
              },
            } as any,
          )
        } else {
          await stakeMars(stakingAmount)
        }
      } else {
        const unstakingAmount = BNCoin.fromDenomAndBigNumber(MARS_DENOM, actualAmount)
        await unstakeMars(unstakingAmount)
      }
    } catch (error: any) {
      console.error('Transaction failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    isValidAmount,
    modal,
    modalType,
    actualAmount,
    stakeMars,
    unstakeMars,
    amount,
    walletBalance,
    account,
  ])

  const handleClose = useCallback(() => {
    useStore.setState({ marsStakingModal: null })
  }, [])

  const handleWithdraw = useCallback(async () => {
    setIsWithdrawing(true)

    useStore.setState({ marsStakingModal: null })

    try {
      const readyAmount = unstakedData?.totalReady
      const withdrawAmount = readyAmount
        ? BNCoin.fromDenomAndBigNumber(MARS_DENOM, readyAmount.shiftedBy(MARS_DECIMALS))
        : undefined
      await withdrawMars(withdrawAmount)
    } catch (error: any) {
      console.error('Withdraw failed:', error)
    } finally {
      setIsWithdrawing(false)
    }
  }, [withdrawMars, unstakedData])

  const handleModeChange = useCallback(
    (type: 'stake' | 'unstake') => {
      if (type !== modalType) {
        setModalType(type)
        setAmount(BN_ZERO)
      }
    },
    [modalType],
  )

  useEffect(() => {
    if (modal) {
      setModalType('stake')
      setAmount(BN_ZERO)
    }
  }, [modal])

  if (!modal) return null

  return (
    <Modal
      onClose={handleClose}
      dialogId='mars-staking-modal'
      header={
        <Text size='lg' className='font-semibold text-white'>
          Manage your MARS stake
        </Text>
      }
      className='w-full max-w-md relative'
      modalClassName='max-w-modal-sm'
      headerClassName='p-6'
      contentClassName='px-6 pb-6'
    >
      <div className='space-y-6'>
        <SwitchWithText
          options={[
            { text: 'Stake', value: 'stake' },
            { text: 'Unstake', value: 'unstake' },
          ]}
          selected={modalType}
          onChange={(v) => handleModeChange(v as 'stake' | 'unstake')}
          className='bg-white/10 rounded-lg'
        />

        <div className='space-y-2'>
          <div className='flex justify-between'>
            <Text size='sm' className='text-white/60'>
              Currently Staked
            </Text>
            <FormattedNumber
              amount={stakedAmount.toNumber()}
              options={{ abbreviated: true, suffix: ' MARS' }}
              className='text-sm'
            />
          </div>
          {account && modalType === 'stake' && (
            <div className='flex justify-between'>
              <Text size='sm' className='text-white/60'>
                {`Account #${account.id} Balance`}
              </Text>
              <FormattedNumber
                amount={accountBalance.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm'
              />
            </div>
          )}
          <div className='flex justify-between'>
            <Text size='sm' className='text-white/60'>
              Wallet Balance
            </Text>
            <FormattedNumber
              amount={walletBalance.toNumber()}
              options={{ abbreviated: true, suffix: ' MARS' }}
              className='text-sm'
            />
          </div>

          {unstakedData?.totalUnstaked?.gt(0) && (
            <div className='flex justify-between'>
              <Text size='sm' className='text-white/60'>
                Unstaking
              </Text>
              <FormattedNumber
                amount={unstakedData.totalUnstaked.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm text-warning'
              />
            </div>
          )}
          {unstakedData?.totalReady?.gt(0) && (
            <div className='flex justify-between'>
              <Text size='sm' className='text-white/60'>
                Ready to Withdraw
              </Text>
              <FormattedNumber
                amount={unstakedData.totalReady.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm text-success'
              />
            </div>
          )}
        </div>

        <Callout type={CalloutType.WARNING} iconClassName='self-start'>
          <div className='flex justify-between items-center mb-2'>
            <Text size='sm' className='font-semibold'>
              Unstaking period:
            </Text>
            <Text size='sm' className='font-semibold'>
              1 day
            </Text>
          </div>
          <Text size='xs' className='ml-[-16px] leading-relaxed'>
            It will take 1 day from when you unstake your tokens until you can withdraw them. During
            that time, you will not receive voting power for the unstaking tokens, nor will you be
            able to cancel the unstaking process.
          </Text>
        </Callout>

        {modalType === 'unstake' && unstakedData && unstakedData.claims.length > 0 && (
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <Text size='sm' className='text-white/80 font-semibold'>
                Pending Unstaked Claims
              </Text>
              {unstakedData.totalReady.gt(0) && (
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  showProgressIndicator={isWithdrawing}
                  color='secondary'
                  size='sm'
                  text={`Withdraw ${unstakedData.totalReady.toFixed(2)} MARS`}
                  className='text-xs'
                />
              )}
            </div>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {unstakedData.totalReady.gt(0) && (
                <Card
                  className='bg-white/5'
                  contentClassName='p-3 flex justify-between items-center'
                >
                  <div className='flex flex-col'>
                    <FormattedNumber
                      amount={unstakedData.totalReady.toNumber()}
                      options={{ abbreviated: true, suffix: ' MARS' }}
                      className='text-sm font-medium'
                    />
                    <Text size='xs' className='text-white/60'>
                      Ready to withdraw
                    </Text>
                  </div>
                  <div className='px-2 py-1 bg-success/20 text-success rounded text-xs font-semibold'>
                    Ready
                  </div>
                </Card>
              )}
              {unstakedData.claims.map(
                (claim) =>
                  !claim.isReady && (
                    <Card
                      key={`${claim.amount.toString()}-${claim.releaseTime.getTime()}`}
                      className='bg-white/5'
                      contentClassName='p-3 flex justify-between items-center'
                    >
                      <div className='flex flex-col'>
                        <FormattedNumber
                          amount={claim.amount.toNumber()}
                          options={{ abbreviated: true, suffix: ' MARS' }}
                          className='text-sm font-medium'
                        />
                        <Text size='xs' className='text-white/60'>
                          Available: {formatReleaseDate(claim.releaseTime)}
                        </Text>
                      </div>
                    </Card>
                  ),
              )}
            </div>
          </div>
        )}

        <TokenInputWithSlider
          amount={amount.shiftedBy(MARS_DECIMALS)}
          asset={marsAsset as Asset}
          max={maxAmount.shiftedBy(MARS_DECIMALS)}
          onChange={handleAmountChange}
          maxText='Available'
          warningMessages={[]}
        />

        {amount.gt(0) && (
          <div className='p-4 bg-white/5 rounded-lg space-y-2'>
            <Text size='sm' className='text-white/60'>
              After {modalType}:
            </Text>
            <div className='flex justify-between'>
              <Text size='sm'>New Staked Amount</Text>
              <FormattedNumber
                amount={newStakedAmount.toNumber()}
                options={{ abbreviated: true, suffix: ' MARS' }}
                className='text-sm'
              />
            </div>
            <div className='flex justify-between'>
              <Text size='sm'>Staking Tier</Text>
              <TierLabel amount={newStakedAmount.toNumber()} withTooltip />
            </div>
          </div>
        )}

        <div className='flex gap-3'>
          <Button onClick={handleClose} color='tertiary' className='flex-1' text='Cancel' />
          <Button
            onClick={handleSubmit}
            disabled={!isValidAmount || isLoading}
            showProgressIndicator={isLoading}
            className='flex-1'
            text={modalType === 'stake' ? 'Stake MARS' : 'Unstake MARS'}
          />
        </div>
      </div>
    </Modal>
  )
}
