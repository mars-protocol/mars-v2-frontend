import { CrossCircled, ExclamationMarkTriangle, Flag } from 'components/common/Icons'

export const INFO_ITEMS = [
  {
    icon: <CrossCircled />,
    title: 'Community vaults are user-created',
    description:
      'These vaults are created by community members and not directly managed by the Mars Protocol team.',
  },
  {
    icon: <Flag />,
    title: 'Understand the risks',
    description:
      "When depositing into community vaults, you're entrusting your funds to another user's investment strategy.",
  },
  {
    icon: <ExclamationMarkTriangle />,
    title: 'Profitability is not guaranteed',
    description: 'As with any investment, past performance does not guarantee future returns.',
  },
]
