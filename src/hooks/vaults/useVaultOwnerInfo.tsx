import { Discord, Telegram, Twitter, Website } from 'components/common/Icons'
import { FALLBACK_AVATAR } from 'constants/managedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStargazeWalletInfo from 'hooks/wallet/useStargazeWalletInfo'
import { useMemo } from 'react'
import { truncate } from 'utils/formatters'

const defaultAvatar: Image = {
  url: FALLBACK_AVATAR,
  width: 50,
  height: 50,
}

interface VaultOwnerInfo {
  vaultOwnerInfo: {
    name: string
    avatar: Image
    link: {
      href: string
      name: string
      title: string
    }
    socials: StargazeSocial[]
    hasStargazeNames: boolean
  }
  isLoading: boolean
}

export default function useVaultOwnerInfo(address?: string): VaultOwnerInfo {
  const { data: stargazeInfo, isLoading } = useStargazeWalletInfo(address)

  const chainConfig = useChainConfig()

  return useMemo(() => {
    const avatar = stargazeInfo ? stargazeInfo.wallet.name.media.visualAssets.lg : defaultAvatar
    const walletLinkTarget = stargazeInfo
      ? `https://www.stargaze.zone/p/${stargazeInfo.wallet.name.associatedAddr}/tokens?from=wallet`
      : `${chainConfig.endpoints.explorer}/address/${address}`
    const walletLinkName = stargazeInfo ? stargazeInfo.wallet.name.name : truncate(address, [2, 6])
    const walletLinkTitle = stargazeInfo
      ? 'View Stargaze Profile'
      : `View on ${chainConfig.explorerName}`

    const socials = [] as StargazeSocial[]
    stargazeInfo?.wallet.name.records.forEach((record) => {
      switch (record.name) {
        case 'twitter':
          socials.push({
            name: 'X Profile',
            verified: record.verified,
            icon: <Twitter />,
            link: `https://x.com/${record.value}`,
          })
          break
        case 'telegram':
          socials.push({
            name: 'Telegram Profile',
            verified: record.verified,
            icon: <Telegram />,
            link: `https://t.me/${record.value}`,
          })
          break
        case 'discord':
          socials.push({
            name: 'Discord Server',
            verified: record.verified,
            icon: <Discord />,
            link: `https://discord.com/invite/${record.value}`,
          })
          break
        case 'website':
          socials.push({
            name: 'Website',
            verified: record.verified,
            icon: <Website />,
            link: record.value,
          })
      }
    })

    return {
      vaultOwnerInfo: {
        name: walletLinkName,
        avatar: avatar,
        link: {
          href: walletLinkTarget,
          name: walletLinkName,
          title: walletLinkTitle,
        },
        socials,
        hasStargazeNames: !!stargazeInfo,
      },
      isLoading: isLoading,
    }
  }, [stargazeInfo, chainConfig.endpoints.explorer, chainConfig.explorerName, address, isLoading])
}
