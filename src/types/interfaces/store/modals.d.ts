interface ModalSlice {
  accountDeleteModal: Account | null
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  alertDialog: AlertDialogConfig | null
  borrowModal: BorrowModal | null
  createAccountModal: boolean
  fundAccountModal: boolean
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  getStartedModal: boolean
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
  onClick?: () => void
}

interface AlertDialogConfig {
  icon?: JSX.Element
  title: JSX.Element | string
  description: JSX.Element | string
  negativeButton?: AlertDialogButton
  positiveButton?: AlertDialogButton
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
