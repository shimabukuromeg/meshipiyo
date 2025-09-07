import { GraphQLClient } from 'graphql-request'
import { cache } from 'react'
import { graphql } from '@/src/gql'
import { SearchContent } from './components/serach-content'

export default async function SearchPage() {
  const data = await fetchMunicipalities()
  console.log(data)

  return (
    <div className="flex flex-col md:gap-8 gap-2 md:p-20 p-2">
      <h1 className="text-2xl md:text-3xl font-bold text-textBlack">検索</h1>
      <div className="md:px-4 px-1">
        <SearchContent municipalities={data.municipalities} />
      </div>
    </div>
  )
}

const MunicipalitiesQuery = graphql(/* GraphQL */ `
  query Municipalities {
    municipalities {
      name
      id
    }
  }
`)

const fetchMunicipalities = async () => {
  const backendEndpoint =
    process.env.BACKEND_ENDPOINT ?? 'http://localhost:44000/graphql'

  const client = new GraphQLClient(backendEndpoint, {
    fetch: cache(async (url: RequestInfo | URL, params?: RequestInit) =>
      fetch(url, { ...params, next: { revalidate: 60 } }),
    ),
  })
  const data = await client.request(MunicipalitiesQuery, {})
  return data
}
