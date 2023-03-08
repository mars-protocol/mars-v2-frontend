import AccountOverview from 'components/Portfolio/AccountOverview'

interface Props {
  params: PageParams
}

export default function PortfolioPage(props: Props) {
  return <AccountOverview params={props.params} />
}
