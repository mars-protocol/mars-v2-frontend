interface ModalSlice {
  accountDeleteModal: Account | null
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  alertDialog: AlertDialogConfig | null
  assetOverlayState: OverlayState
  hlsModal: HlsModal | null
  hlsManageModal: HlsManageModal | null
  borrowModal: BorrowModal | null
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  getStartedModal: boolean
  hlsInformationModal: boolean | null
  lendAndReclaimModal: LendAndReclaimModalConfig | null
  settingsModal: boolean
  unlockModal: UnlockModal | null
  vaultModal: VaultModal | null
  walletAssetsModal: WalletAssetModal | null
  withdrawFromVaultsModal: DepositedVault[] | null
}

interface AlertDialogButton {
  text?: string
  icon?: JSX.Element
  isAsync?: boolean
  onClick?: () => Promise<void> | void
}

interface AlertDialogConfig {
  icon?: JSX.Element
  checkbox?: {
    text: string
    onClick: (isChecked: boolean) => void
  }
  content: JSX.Element | string
  negativeButton?: AlertDialogButton
  positiveButton?: AlertDialogButton
  title: string
}

interface BorrowModal {
  asset: Asset
  marketData: BorrowMarketTableData
  isRepay?: boolean
}

type LendAndReclaimModalAction = 'lend' | 'reclaim'

interface LendAndReclaimModalConfig {
  data: LendingMarketTableData
  action: LendAndReclaimModalAction
}

interface VaultModal {
  vault: Vault | DepositedVault
  isDeposited?: boolean
  selectedBorrowDenoms: string[]
  isCreate: boolean
}

interface AddVaultBorrowingsModal {
  selectedDenoms: string[]
}

interface UnlockModal {
  vault: DepositedVault
}

interface WalletAssetModal {
  isOpen?: boolean
  selectedDenoms: string[]
  isBorrow?: boolean
}

interface HlsModal {
  strategy?: HLSStrategy
  vault?: Vault
}

interface HlsManageModal {
  accountId: string
  staking: {
    strategy: HLSStrategy
    action: HlsStakingManageAction
  }
}

type HlsStakingManageAction = 'deposit' | 'withdraw' | 'repay'
