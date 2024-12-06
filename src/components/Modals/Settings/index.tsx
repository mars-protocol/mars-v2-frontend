import { useShuttle } from '@delphi-labs/shuttle-react'
import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import chains from 'chains'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import { ArrowCircle, Enter } from 'components/common/Icons'
import NumberInput from 'components/common/NumberInput'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import TextInput from 'components/common/TextInput'
import { TextLink } from 'components/common/TextLink'
import Modal from 'components/Modals/Modal'
import SettingsOptions from 'components/Modals/Settings/SettingsOptions'
import SettingsSwitch from 'components/Modals/Settings/SettingsSwitch'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useStore from 'store'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import { BN } from 'utils/helpers'

const slippages = [0.01, 0.02]

export default function SettingsModal() {
  const chainConfig = useChainConfig()
  const chainId = getCurrentChainId()
  const { disconnectWallet } = useShuttle()
  const currentWallet = useCurrentWallet()
  const modal = useStore((s) => s.settingsModal)
  const { open: showResetDialog } = useAlertDialog()
  const displayCurrencies = useDisplayCurrencyAssets()
  const { setAutoLendOnAllAccounts } = useAutoLend()
  const [customSlippage, setCustomSlippage] = useState<number>(0)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)

  const [displayCurrency, setDisplayCurrency] = useDisplayCurrency()
  const [rpcEndpoint, setRpcEndpoint] = useLocalStorage<string>(
    `${chainConfig.id}/${LocalStorageKeys.RPC_ENDPOINT}`,
    chainConfig.endpoints.rpc,
  )
  const [restEndpoint, setRestEndpoint] = useLocalStorage<string>(
    `${chainConfig.id}/${LocalStorageKeys.REST_ENDPOINT}`,
    chainConfig.endpoints.rest,
  )
  const [reduceMotion, setReduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const [tutorial, setTutorial] = useLocalStorage<boolean>(
    LocalStorageKeys.TUTORIAL,
    getDefaultChainSettings(chainConfig).tutorial,
  )
  const [enableAutoLendGlobal, setLendAssets] = useEnableAutoLendGlobal()
  const [slippage, setSlippage] = useLocalStorage<number>(
    LocalStorageKeys.SLIPPAGE,
    getDefaultChainSettings(chainConfig).slippage,
  )
  const [updateOracle, setUpdateOracle] = useLocalStorage<boolean>(
    LocalStorageKeys.UPDATE_ORACLE,
    getDefaultChainSettings(chainConfig).updateOracle,
  )
  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.SHOW_SUMMARY}`,
    getDefaultChainSettings(chainConfig).showSummary,
  )

  const [tempRpcEndpoint, setTempRpcEndpoint] = useState('')
  const [tempRestEndpoint, setTempRestEndpoint] = useState('')
  const [validRpc, setValidRpc] = useState(true)
  const [validRest, setValidRest] = useState(true)

  const [theme, setTheme] = useLocalStorage<string>(
    LocalStorageKeys.THEME,
    getDefaultChainSettings(chainConfig).theme,
  )
  const themeOptions: SelectOption[] = [
    { label: 'Default', value: 'default' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ]

  const displayCurrenciesOptions = useMemo(
    () =>
      displayCurrencies.map((asset, index) => ({
        label: (
          <div className='flex w-full gap-2' key={index}>
            {asset.denom === 'usd' ? (
              <Text size='sm' className='w-4 h-4 leading-4 text-center'>
                {asset.symbol}
              </Text>
            ) : (
              <AssetImage asset={asset} className='w-4 h-4' />
            )}
            <Text size='sm' className='leading-4'>
              {asset.name}
            </Text>
          </div>
        ),
        value: asset.denom,
      })),
    [displayCurrencies],
  )

  const handleReduceMotion = useCallback(
    (value: boolean) => {
      setReduceMotion(value)
    },
    [setReduceMotion],
  )

  const handleLendAssets = useCallback(
    (value: boolean) => {
      setAutoLendOnAllAccounts(value)
      setLendAssets(value)
    },
    [setLendAssets, setAutoLendOnAllAccounts],
  )

  const handleTutorial = useCallback(
    (value: boolean) => {
      setTutorial(value)
    },
    [setTutorial],
  )

  const handleDisplayCurrency = useCallback(
    (value: string) => {
      setDisplayCurrency(value)
    },
    [setDisplayCurrency],
  )

  const handleTheme = useCallback(
    (value: string) => {
      if (!window) return
      const root = window.document.documentElement
      root.setAttribute('data-theme', value)
      setTheme(value)
    },
    [setTheme],
  )

  const handleSlippageInputFocus = useCallback(() => {
    setIsCustom(true)
  }, [])

  const handleSlippage = useCallback(
    (value: number) => {
      setSlippage(value)
    },
    [setSlippage],
  )

  const handleSlippageInputBlur = useCallback(() => {
    setIsCustom(false)

    if (!customSlippage) {
      setCustomSlippage(0)
      handleSlippage(slippages[0])
      return
    }

    const value = Number(customSlippage || 0)
    if (slippages.includes(value)) {
      setCustomSlippage(0)
      handleSlippage(value)
      return
    }

    handleSlippage(BN(customSlippage).toNumber())
  }, [customSlippage, handleSlippage])

  const handleSlippageInput = useCallback(
    (value: BigNumber) => {
      if (!value.toString()) {
        return
      }
      setCustomSlippage(value.dividedBy(100).toNumber())
      handleSlippage(value.dividedBy(100).toNumber())
    },
    [handleSlippage],
  )

  const handleUpdateOracle = useCallback(
    (value: boolean) => {
      setUpdateOracle(value)
    },
    [setUpdateOracle],
  )

  const handleShowSummary = useCallback(
    (value: boolean) => {
      setShowSummary(value)
    },
    [setShowSummary],
  )

  const handleResetSettings = useCallback(() => {
    handleDisplayCurrency(getDefaultChainSettings(chainConfig).displayCurrency)
    handleSlippage(getDefaultChainSettings(chainConfig).slippage)
    handleReduceMotion(getDefaultChainSettings(chainConfig).reduceMotion)
    handleLendAssets(getDefaultChainSettings(chainConfig).enableAutoLendGlobal)
    handleTutorial(getDefaultChainSettings(chainConfig).tutorial)
    handleUpdateOracle(getDefaultChainSettings(chainConfig).updateOracle)
    handleTheme(getDefaultChainSettings(chainConfig).theme)
    handleShowSummary(getDefaultChainSettings(chainConfig).showSummary)
    setTempRpcEndpoint(chains[chainId].endpoints.rpc)
    setTempRestEndpoint(chains[chainId].endpoints.rest)
    setRpcEndpoint(chains[chainId].endpoints.rpc)
    setRestEndpoint(chains[chainId].endpoints.rest)
  }, [
    handleDisplayCurrency,
    chainConfig,
    handleSlippage,
    handleReduceMotion,
    handleLendAssets,
    handleTutorial,
    handleUpdateOracle,
    handleTheme,
    handleShowSummary,
    chainId,
    setRpcEndpoint,
    setRestEndpoint,
  ])

  const validateRpcEndpoint = useCallback(
    async (value: string) => {
      try {
        const url = new URL(value)
        const isValidEndpoint = await fetch(`${url.href}status?`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          const json = await res.json()
          return json?.result?.node_info?.network === chainId
        })
        if (isValidEndpoint) {
          setValidRpc(true)
          setRpcEndpoint(value)
        }
      } catch (error) {
        setValidRpc(false)
      }
    },
    [setValidRpc, chainId, setRpcEndpoint],
  )

  const validateRestEndpoint = useCallback(
    async (value: string) => {
      try {
        const url = new URL(value)
        const isValidEndpoint = await fetch(
          `${url.href}cosmos/base/tendermint/v1beta1/blocks/latest`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ).then(async (res) => {
          const result = await res.json()
          return result?.block?.header?.chain_id === chainId
        })
        if (isValidEndpoint) {
          setValidRest(true)
          setRestEndpoint(value)
        }
      } catch (error) {
        setValidRest(false)
      }
    },
    [setValidRest, chainId, setRestEndpoint],
  )

  const hasEndpointsChangedValid = useMemo(
    () => (tempRestEndpoint !== '' && validRest) || (tempRpcEndpoint !== '' && validRpc),
    [tempRestEndpoint, tempRpcEndpoint, validRest, validRpc],
  )

  const showResetModal = useCallback(() => {
    showResetDialog({
      icon: (
        <div className='flex w-full h-full p-3'>
          <ArrowCircle />
        </div>
      ),
      title: 'Are you sure you want to restore to default?',
      content:
        'Once you reset to default settings you can’t revert it, and will result in the permanent loss of your current settings',
      positiveButton: {
        text: 'Yes',
        icon: <Enter />,
        onClick: handleResetSettings,
      },
    })
  }, [showResetDialog, handleResetSettings])

  const handleCloseModal = useCallback(() => {
    if (hasEndpointsChangedValid && currentWallet) {
      disconnectWallet(currentWallet)
      window.location.reload()
    }
    setTempRestEndpoint('')
    setTempRpcEndpoint('')
    setValidRest(true)
    setValidRpc(true)
    useStore.setState({ settingsModal: false })
  }, [hasEndpointsChangedValid, currentWallet, disconnectWallet])

  if (!modal) return null

  return (
    <Modal
      onClose={handleCloseModal}
      header={
        <span className='flex flex-wrap items-center'>
          <Text size='3xl' className='w-full pb-1'>
            Global Settings
          </Text>
          <Text size='sm' className='text-white/50'>
            Customise to match your workflow
          </Text>
        </span>
      }
      headerClassName='p-6'
      contentClassName='flex flex-wrap px-6 pb-6 pt-4'
    >
      <SettingsOptions
        label='Theme'
        description='Change the appearance of the Outpost.'
        className='pb-6'
      >
        <Select
          options={themeOptions.map((option) => ({
            label: (
              <Text size='sm' className='leading-4'>
                {option.label}
              </Text>
            ),
            value: option.value,
          }))}
          defaultValue={theme}
          onChange={handleTheme}
          className='relative border w-60 rounded-base border-white/10'
          containerClassName='justify-end'
        />
      </SettingsOptions>
      <SettingsSwitch
        onChange={handleLendAssets}
        name='enableAutoLendGlobal'
        value={enableAutoLendGlobal}
        label='Lend assets in Credit Accounts'
        description='By turning this on you will automatically lend out all the assets you deposit into your Credit Accounts to earn yield.'
        withStatus
      />
      <SettingsSwitch
        onChange={handleUpdateOracle}
        name='updateOracle'
        value={updateOracle}
        label='Update Pyth Oracles on transactions'
        description={`When this setting is on, your Mars transactions will automatically trigger an update of Pyth's price oracles. This increases the accuracy of the prices shown in the UI. In some instances, this could cause your transactions to fail when using a Ledger hardware wallet. If you encounter transaction failures with Ledger, please turn this setting off.`}
        withStatus
      />
      <SettingsSwitch
        onChange={handleReduceMotion}
        name='reduceMotion'
        value={reduceMotion}
        label='Reduce Motion'
        description='Turns off all animations inside the dApp. Turning animations off can increase the
        overall performance on lower-end hardware.'
        withStatus
      />
      <SettingsSwitch
        onChange={handleTutorial}
        name='tutoruial'
        value={tutorial}
        label='Tutorial'
        description={
          <Text size='xs' className='text-white/50'>
            Show tutorial elements in the UI. Like the page info boxes or{' '}
            <TextLink
              title='Get Started'
              color='secondary'
              textSize='extraSmall'
              className='leading-4 text-white hover:underline'
              onClick={() => {
                useStore.setState({
                  settingsModal: false,
                  // TODO: update docs to reflect the current state of v2
                  //getStartedModal: true
                })
              }}
            >
              Get Started.
            </TextLink>
          </Text>
        }
        withStatus
      />
      {chainConfig.perps && (
        <SettingsSwitch
          onChange={handleShowSummary}
          name='toggleShowSummary'
          value={showSummary}
          label='Show Order Summary on Perps'
          description='Toggle this setting to show or hide the order summary when placing a trade on Perps.'
          withStatus
        />
      )}
      <SettingsOptions
        label='Display Currency'
        description='Convert all values to the selected asset/currency.'
        className='pb-6'
      >
        <Select
          options={displayCurrenciesOptions}
          defaultValue={displayCurrency}
          onChange={handleDisplayCurrency}
          className='relative border w-60 rounded-base border-white/10'
          containerClassName='justify-end'
        />
      </SettingsOptions>
      <SettingsOptions
        label='Slippage tolerance'
        description='Some vaults require token swaps. The transaction will fail if the price of the swap asset changes unfavourably by more than this percentage'
        className='pb-21'
      >
        {slippages.map((value) => (
          <Button
            key={`slippage-${value}`}
            color='secondary'
            variant='rounded'
            onClick={() => {
              handleSlippage(value)
            }}
            className={classNames(
              'mr-3 text-[16px]',
              slippage === value && !isCustom && 'bg-white/10',
            )}
            text={`${value * 100}%`}
          />
        ))}
        <Button
          onClick={() => inputRef?.current?.focus()}
          color='secondary'
          variant='rounded'
          className={classNames('w-16', !slippages.includes(slippage) && 'bg-white/10')}
        >
          <NumberInput
            asset={{ decimals: 0, symbol: '%' }}
            onRef={setInputRef}
            onChange={handleSlippageInput}
            onBlur={handleSlippageInputBlur}
            onFocus={handleSlippageInputFocus}
            amount={BN(customSlippage).multipliedBy(100)}
            max={BN(10)}
            min={BN_ZERO}
            maxDecimals={1}
            maxLength={2}
            style={{ fontSize: 16 }}
            placeholder='...'
            className='!w-6'
          />
          %
        </Button>
      </SettingsOptions>
      <SettingsOptions
        label='RPC and REST endpoints'
        description='Set a custom RPC and REST endpoint for current chain.'
        className='pb-6'
        fullwidth
      >
        <div className='flex flex-wrap items-stretch w-full gap-4'>
          <TextInput
            label='RPC'
            placeholder='https://'
            value={tempRpcEndpoint === '' ? rpcEndpoint : tempRpcEndpoint}
            onChange={(value) => {
              setTempRpcEndpoint(value)
              validateRpcEndpoint(value)
            }}
            error={!validRpc}
            errorMessage={`Invalid ${chainId} RPC Endpoint. Failed to fetch the /status? API.`}
            className='w-full'
          />
          <TextInput
            label='REST'
            value={tempRestEndpoint === '' ? restEndpoint : tempRestEndpoint}
            placeholder='https://'
            onChange={(value) => {
              setTempRestEndpoint(value)
              validateRestEndpoint(value)
            }}
            error={!validRest}
            errorMessage={`Invalid ${chainId} REST Endpoint. Failed to fetch the latest block.`}
            className='w-full'
          />
          {hasEndpointsChangedValid && (
            <Callout type={CalloutType.INFO} className='w-full'>
              The app will reload and you will have to re-connect the wallet.
            </Callout>
          )}
        </div>
      </SettingsOptions>
      <div className='flex flex-wrap justify-center w-full gap-4 md:justify-between md:flex-nowrap'>
        <Button
          color='quaternary'
          variant='transparent'
          onClick={showResetModal}
          leftIcon={<ArrowCircle />}
          text='Reset to default settings'
        />
        <Button text='Confirm' onClick={handleCloseModal} disabled={!validRest || !validRpc} />
      </div>
    </Modal>
  )
}
