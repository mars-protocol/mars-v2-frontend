import FarmPage from 'components/pages/farm'

export default async function page({ params }: { params: PageParams }) {
  return <FarmPage params={params} />
}
