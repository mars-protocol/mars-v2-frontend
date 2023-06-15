interface ModalSlice {
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  borrowModal: BorrowModal | null
  createAccountModal: boolean
  deleteAccountModal: boolean
  fundAccountModal: boolean
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  vaultModal: VaultModal | null
  unlockVaultModal: UnlockVaultModal | null
}

interface BorrowModal {
  asset: Asset
  marketData: BorrowAsset | BorrowAssetActive
  isRepay?: boolean
}

interface VaultModal {
  vault: Vault
  selectedBorrowDenoms: string[]
}

interface AddVaultBorrowingsModal {
  selectedDenoms: string[]
}

interface UnlockVaultModal {
  vault: Vault
}
