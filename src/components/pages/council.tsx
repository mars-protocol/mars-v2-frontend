import Overview from 'components/Council/Overview'

interface Props {
  params: PageParams
}

export default function CouncilPage(props: Props) {
  return <Overview params={props.params} />
}
