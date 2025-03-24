import Modal from 'components/Modals/Modal'
import SkipBridgeModalGraphic from 'components/common/Icons/SkipBridgeModalGraphic.svg'
import Text from 'components/common/Text'
import Link from 'next/link'
import { ExternalLink } from 'components/common/Icons'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { isUsdcFeeToken, MIN_USDC_FEE_AMOUNT } from 'utils/feeToken'
import Button from 'components/common/Button'
import { useNavigate } from 'react-router-dom'
import { getPage, getRoute } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { useEffect, useState } from 'react'
import { useFeeToken } from 'hooks/wallet/useFeeToken'
import { Tooltip } from 'components/common/Tooltip'

export default function SkipBridgeModal() {
  const { skipBridges, clearSkipBridges } = useSkipBridgeStatus()
  const navigate = useNavigate()
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const { setFeeToken } = useFeeToken()
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDepositComplete, setIsDepositComplete] = useState(false)
  const [hasAttemptedDeposit, setHasAttemptedDeposit] = useState(false)

  const completedBridges = skipBridges.filter((bridge) => bridge.status === 'STATE_COMPLETED')
  const pendingBridges = skipBridges.filter((bridge) => bridge.status === 'STATE_PENDING')
  const totalBridgedAmount = completedBridges.reduce(
    (acc, bridge) => acc.plus(bridge.amount),
    BN(0),
  )

  useEffect(() => {
    if (completedBridges.length > 0 && !pendingBridges.length) {
      setFeeToken({
        coinDenom: 'USDC',
        coinMinimalDenom: chainConfig.stables[0],
        coinDecimals: 6,
      })
    }
  }, [completedBridges.length, pendingBridges.length, chainConfig.stables, setFeeToken])

  const handleCompleteTransaction = async () => {
    if (!address || isCompleting) return

    setIsCompleting(true)
    setError(null)
    setHasAttemptedDeposit(true)
    try {
      const depositAmount = totalBridgedAmount.minus(MIN_USDC_FEE_AMOUNT)
      if (depositAmount.isGreaterThan(0)) {
        const depositCoin = WrappedBNCoin.fromDenomAndBigNumber(
          chainConfig.stables[0],
          depositAmount,
        )
        const depositObject = {
          coins: [depositCoin.coin],
          lend: true,
          isAutoLend: true,
          overrides: {
            feeCurrency: {
              coinDenom: 'USDC',
              coinMinimalDenom: chainConfig.stables[0],
              coinDecimals: 6,
            },
          },
        }
        const accountId = await deposit(depositObject)
        if (accountId) {
          useStore.setState((state) => ({
            ...state,
            selectedAccountId: accountId,
            accountId: accountId,
            currentAccount: null,
          }))
          setIsDepositComplete(true)

          const { pathname } = window.location
          const searchParams = new URLSearchParams(window.location.search)
          navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, accountId))
        }
      }
    } catch (error) {
      console.error('Failed to complete transaction:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to complete transaction. Please try again.',
      )
      setIsDepositComplete(false)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleConfirmAndClose = () => {
    if (!isDepositComplete) return

    clearSkipBridges()
    useStore.setState((state) => ({
      ...state,
      walletAssetsModal: null,
      focusComponent: null,
      fundAndWithdrawModal: null,
      selectedAccountId: null,
      accountId: null,
      currentAccount: null,
    }))
  }

  useEffect(() => {
    if (isDepositComplete) {
      handleConfirmAndClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDepositComplete])

  const getButtonConfig = () => {
    if (isDepositComplete) {
      return {
        text: 'Close',
        onClick: handleConfirmAndClose,
        color: 'secondary' as const,
        showProgressIndicator: false,
        disabled: false,
      }
    }

    if (isCompleting) {
      return {
        text: 'Completing Transaction...',
        onClick: handleCompleteTransaction,
        showProgressIndicator: true,
        disabled: true,
      }
    }

    if (error || hasAttemptedDeposit) {
      return {
        text: 'Try Again',
        onClick: handleCompleteTransaction,
        showProgressIndicator: false,
        disabled: false,
      }
    }

    return {
      text: 'Complete Transaction',
      onClick: handleCompleteTransaction,
      showProgressIndicator: false,
      disabled: false,
    }
  }

  return (
    <Modal
      header={null}
      onClose={() => {}}
      hideCloseBtn={true}
      content={
        <div className='p-4 text-center'>
          <div className='flex justify-center'>
            <div className='mb-[-196px]'>
              <SkipBridgeModalGraphic />
            </div>
          </div>
          <h3 className='font-bold mb-4'>
            {isDepositComplete
              ? 'Deposit Complete!'
              : pendingBridges.length > 0
                ? 'Bridge Transaction in Progress'
                : 'Bridge Complete'}
          </h3>
          <div className='flex items-center justify-center gap-1'>
            <Text tag='p' className='text-center opacity-60'>
              {isDepositComplete
                ? 'Your USDC has been successfully deposited.'
                : pendingBridges.length > 0
                  ? "Your bridge transaction is still processing. Please check back later. The app's functionality is limited until the transaction completes."
                  : 'Your USDC has been successfully bridged.'}
            </Text>

            <Tooltip
              type='info'
              content='0.15 USDC will be kept in your wallet for gas fees since USDC is your current fee token.'
            />
          </div>

          {error && (
            <Text tag='p' className='text-red-500 mb-4'>
              {error}
            </Text>
          )}

          <div className='mt-6 flex flex-col items-center'>
            {completedBridges.length > 0 && !pendingBridges.length && !isDepositComplete && (
              <Button className='w-full' color='primary' {...getButtonConfig()} />
            )}
          </div>

          {pendingBridges.map((bridge) => (
            <div className='flex items-center justify-center my-4' key={bridge.txHash}>
              <Link target='_blank' href={bridge.explorerLink} className='flex items-center'>
                <Text tag='p' className='text-center'>
                  Track your transaction
                </Text>
                <div className='w-3 h-3 ml-1 mt-1 flex items-center justify-center'>
                  <ExternalLink />
                </div>
              </Link>
            </div>
          ))}
        </div>
      }
    />
  )
}
