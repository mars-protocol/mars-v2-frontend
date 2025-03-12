import { CrossCircled, Flag, TrashBin } from 'components/common/Icons'

export const INFO_ITEMS = [
  {
    icon: <CrossCircled />,
    title: 'Community vaults are not moderated ',
    description:
      'Community vaults are created by users and not reviewed by the Mars Protocol team.',
  },
  {
    icon: <Flag />,
    title: 'Your funds may be at risk',
    description:
      "By depositing, you're trusting another user's investment strategy with your funds.",
  },
  {
    icon: <TrashBin />,
    title: 'Profitability is not guaranteed',
    description: 'Past performance of community vaults does not guarantee future returns.',
  },
]
