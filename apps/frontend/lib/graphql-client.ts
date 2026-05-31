import { GraphQLClient } from 'graphql-request'
import { cache } from 'react'

const DEFAULT_BACKEND_ENDPOINT = 'http://localhost:44000/graphql'

type FetchInput = Parameters<typeof fetch>[0]
type FetchInit = Parameters<typeof fetch>[1]
type NextFetchInit = NonNullable<FetchInit> & {
  next?: {
    revalidate?: number | false
  }
}

function getBackendEndpoint() {
  return process.env.BACKEND_ENDPOINT ?? DEFAULT_BACKEND_ENDPOINT
}

const noStoreFetch = async (url: FetchInput, params?: FetchInit) =>
  fetch(url, { ...params, cache: 'no-store' })

const cachedNoStoreFetch = cache(noStoreFetch)

const createRevalidateFetch = (seconds: number) =>
  cache(async (url: FetchInput, params?: FetchInit) =>
    fetch(url, {
      ...params,
      next: { revalidate: seconds },
    } as NextFetchInit),
  )

export function createNoStoreGraphQLClient({ cached = false } = {}) {
  return new GraphQLClient(getBackendEndpoint(), {
    fetch: cached ? cachedNoStoreFetch : noStoreFetch,
  })
}

export function createRevalidatedGraphQLClient(seconds: number) {
  return new GraphQLClient(getBackendEndpoint(), {
    fetch: createRevalidateFetch(seconds),
  })
}
