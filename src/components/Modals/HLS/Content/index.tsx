import React, { useMemo, useState } from 'react'

import Accordion from 'components/Accordion'
import useStakingController from 'components/Modals/HLS/Content//useStakingController'
import useVaultController from 'components/Modals/HLS/Content//useVaultController'
import useAccordionItems from 'components/Modals/HLS/Content/useAccordionItems'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import useAccounts from 'hooks/useAccounts'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useVault from 'hooks/useVault'
import useStore from 'store'
import { isAccountEmpty } from 'utils/accounts'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  borrowDenom: string
  collateralDenom: string
  vaultAddress: string | null
}

export default function Controller(props: Props) {
  const collateralAsset = getAssetByDenom(props.collateralDenom)
  const borrowAsset = getAssetByDenom(props.borrowDenom)
  const [selectedAccount, setSelectedAccount] = useState<Account>(EMPTY_ACCOUNT_HLS)
  const [isOpen, toggleIsOpen] = useIsOpenArray(4, false)
  const address = useStore((s) => s.address)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', address)
  const emptyHlsAccounts = useMemo(
    () => hlsAccounts.filter((account) => isAccountEmpty(account)),
    [hlsAccounts],
  )
  const walletCollateralAsset = useCurrentWalletBalance(props.collateralDenom)
  const vault = useVault(props.vaultAddress || '')

  if (!collateralAsset || !borrowAsset) return null

  if (vault)
    return (
      <Vault
        walletCollateralAsset={walletCollateralAsset}
        vault={vault}
        collateralAsset={collateralAsset}
        borrowAsset={borrowAsset}
        emptyHlsAccounts={emptyHlsAccounts}
        hlsAccounts={hlsAccounts}
        isOpen={isOpen}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        toggleIsOpen={toggleIsOpen}
      />
    )

  return (
    <StakingContent
      walletCollateralAsset={walletCollateralAsset}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
      emptyHlsAccounts={emptyHlsAccounts}
      hlsAccounts={hlsAccounts}
      isOpen={isOpen}
      selectedAccount={selectedAccount}
      setSelectedAccount={setSelectedAccount}
      toggleIsOpen={toggleIsOpen}
    />
  )
}

interface ContentProps {
  borrowAsset: Asset
  collateralAsset: Asset
  emptyHlsAccounts: Account[]
  hlsAccounts: Account[]
  isOpen: boolean[]
  selectedAccount: Account
  setSelectedAccount: (account: Account) => void
  toggleIsOpen: (index: number) => void
  walletCollateralAsset: Coin | undefined
}

interface VaultContentProps extends ContentProps {
  vault: Vault
}

function Vault(props: VaultContentProps) {
  const {
    borrowAmount,
    depositAmount,
    execute,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    updatedAccount,
  } = useVaultController({
    vault: props.vault,
    collateralAsset: props.collateralAsset,
    borrowAsset: props.borrowAsset,
    selectedAccount: props.selectedAccount,
  })

  const items = useAccordionItems({
    apy: props.vault.apy || 0,
    borrowAmount,
    borrowAsset: props.borrowAsset,
    collateralAsset: props.collateralAsset,
    depositAmount,
    emptyHlsAccounts: props.emptyHlsAccounts,
    execute,
    hlsAccounts: props.hlsAccounts,
    isOpen: props.isOpen,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount: props.selectedAccount,
    setSelectedAccount: props.setSelectedAccount,
    toggleIsOpen: props.toggleIsOpen,
    updatedAccount,
    walletCollateralAsset: props.walletCollateralAsset,
  })

  return <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide' items={items} />
}

function StakingContent(props: ContentProps) {
  const {
    depositAmount,
    onChangeCollateral,
    updatedAccount,
    borrowAmount,
    onChangeDebt,
    leverage,
    maxBorrowAmount,
    positionValue,
    execute,
  } = useStakingController({
    collateralAsset: props.collateralAsset,
    borrowAsset: props.borrowAsset,
    selectedAccount: props.selectedAccount,
  })

  const items = useAccordionItems({
    borrowAmount,
    borrowAsset: props.borrowAsset,
    collateralAsset: props.collateralAsset,
    depositAmount,
    emptyHlsAccounts: props.emptyHlsAccounts,
    execute,
    hlsAccounts: props.hlsAccounts,
    isOpen: props.isOpen,
    leverage,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount: props.selectedAccount,
    setSelectedAccount: props.setSelectedAccount,
    toggleIsOpen: props.toggleIsOpen,
    updatedAccount,
    maxBorrowAmount,
    apy: 0, // TODO: Implement APY
    walletCollateralAsset: props.walletCollateralAsset,
  })

  return <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide' items={items} />
}
