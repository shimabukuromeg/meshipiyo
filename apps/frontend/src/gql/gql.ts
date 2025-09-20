/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query MeshiSearch($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          imageUrl\n          siteUrl\n          title\n          storeName\n          publishedDate\n          createdAt\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.MeshiSearchDocument,
    "\n  query Municipality($id: ID!) {\n    municipality(id: $id) {\n      createdAt\n      name\n      id\n      meshis {\n        id\n        ...MeshiCard\n      }\n    }\n  }\n": typeof types.MunicipalityDocument,
    "\n  query Meshi($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          ...MeshiCard\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.MeshiDocument,
    "\n  query Municipalities {\n    municipalities {\n      name\n      id\n    }\n  }\n": typeof types.MunicipalitiesDocument,
    "\n  fragment MeshiCard on Meshi {\n    id\n    imageUrl\n    siteUrl\n    title\n    storeName\n    publishedDate\n    createdAt\n    isLiked\n    likeCount\n    municipality {\n      id\n      name\n    }\n  }\n": typeof types.MeshiCardFragmentDoc,
    "\n  query MeshiDetail($id: ID!) {\n    meshi(id: $id) {\n      id\n      title\n      address\n      articleId\n      createdAt\n      imageUrl\n      storeName\n      siteUrl\n      publishedDate\n      municipality {\n        name\n        id\n        createdAt\n      }\n    }\n  }\n": typeof types.MeshiDetailDocument,
    "mutation LikeMeshi($meshiId: ID!) {\n  likeMeshi(meshiId: $meshiId) {\n    id\n    createdAt\n    user {\n      id\n      name\n    }\n    meshi {\n      id\n      title\n    }\n  }\n}\n\nmutation UnlikeMeshi($meshiId: ID!) {\n  unlikeMeshi(meshiId: $meshiId)\n}": typeof types.LikeMeshiDocument,
    "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input) {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateUserDocument,
    "query MyLikes($first: Int, $after: String) {\n  myLikes(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        createdAt\n        meshi {\n          id\n          title\n          imageUrl\n          storeName\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    totalCount\n  }\n}": typeof types.MyLikesDocument,
    "query Me {\n  me {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n    likeCount\n  }\n}": typeof types.MeDocument,
};
const documents: Documents = {
    "\n  query MeshiSearch($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          imageUrl\n          siteUrl\n          title\n          storeName\n          publishedDate\n          createdAt\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.MeshiSearchDocument,
    "\n  query Municipality($id: ID!) {\n    municipality(id: $id) {\n      createdAt\n      name\n      id\n      meshis {\n        id\n        ...MeshiCard\n      }\n    }\n  }\n": types.MunicipalityDocument,
    "\n  query Meshi($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          ...MeshiCard\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.MeshiDocument,
    "\n  query Municipalities {\n    municipalities {\n      name\n      id\n    }\n  }\n": types.MunicipalitiesDocument,
    "\n  fragment MeshiCard on Meshi {\n    id\n    imageUrl\n    siteUrl\n    title\n    storeName\n    publishedDate\n    createdAt\n    isLiked\n    likeCount\n    municipality {\n      id\n      name\n    }\n  }\n": types.MeshiCardFragmentDoc,
    "\n  query MeshiDetail($id: ID!) {\n    meshi(id: $id) {\n      id\n      title\n      address\n      articleId\n      createdAt\n      imageUrl\n      storeName\n      siteUrl\n      publishedDate\n      municipality {\n        name\n        id\n        createdAt\n      }\n    }\n  }\n": types.MeshiDetailDocument,
    "mutation LikeMeshi($meshiId: ID!) {\n  likeMeshi(meshiId: $meshiId) {\n    id\n    createdAt\n    user {\n      id\n      name\n    }\n    meshi {\n      id\n      title\n    }\n  }\n}\n\nmutation UnlikeMeshi($meshiId: ID!) {\n  unlikeMeshi(meshiId: $meshiId)\n}": types.LikeMeshiDocument,
    "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input) {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n  }\n}": types.UpdateUserDocument,
    "query MyLikes($first: Int, $after: String) {\n  myLikes(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        createdAt\n        meshi {\n          id\n          title\n          imageUrl\n          storeName\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    totalCount\n  }\n}": types.MyLikesDocument,
    "query Me {\n  me {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n    likeCount\n  }\n}": types.MeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MeshiSearch($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          imageUrl\n          siteUrl\n          title\n          storeName\n          publishedDate\n          createdAt\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query MeshiSearch($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          imageUrl\n          siteUrl\n          title\n          storeName\n          publishedDate\n          createdAt\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Municipality($id: ID!) {\n    municipality(id: $id) {\n      createdAt\n      name\n      id\n      meshis {\n        id\n        ...MeshiCard\n      }\n    }\n  }\n"): (typeof documents)["\n  query Municipality($id: ID!) {\n    municipality(id: $id) {\n      createdAt\n      name\n      id\n      meshis {\n        id\n        ...MeshiCard\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Meshi($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          ...MeshiCard\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query Meshi($first: Int = 20, $after: String, $query: String) {\n    meshis(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          ...MeshiCard\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Municipalities {\n    municipalities {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  query Municipalities {\n    municipalities {\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MeshiCard on Meshi {\n    id\n    imageUrl\n    siteUrl\n    title\n    storeName\n    publishedDate\n    createdAt\n    isLiked\n    likeCount\n    municipality {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment MeshiCard on Meshi {\n    id\n    imageUrl\n    siteUrl\n    title\n    storeName\n    publishedDate\n    createdAt\n    isLiked\n    likeCount\n    municipality {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MeshiDetail($id: ID!) {\n    meshi(id: $id) {\n      id\n      title\n      address\n      articleId\n      createdAt\n      imageUrl\n      storeName\n      siteUrl\n      publishedDate\n      municipality {\n        name\n        id\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query MeshiDetail($id: ID!) {\n    meshi(id: $id) {\n      id\n      title\n      address\n      articleId\n      createdAt\n      imageUrl\n      storeName\n      siteUrl\n      publishedDate\n      municipality {\n        name\n        id\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation LikeMeshi($meshiId: ID!) {\n  likeMeshi(meshiId: $meshiId) {\n    id\n    createdAt\n    user {\n      id\n      name\n    }\n    meshi {\n      id\n      title\n    }\n  }\n}\n\nmutation UnlikeMeshi($meshiId: ID!) {\n  unlikeMeshi(meshiId: $meshiId)\n}"): (typeof documents)["mutation LikeMeshi($meshiId: ID!) {\n  likeMeshi(meshiId: $meshiId) {\n    id\n    createdAt\n    user {\n      id\n      name\n    }\n    meshi {\n      id\n      title\n    }\n  }\n}\n\nmutation UnlikeMeshi($meshiId: ID!) {\n  unlikeMeshi(meshiId: $meshiId)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input) {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input) {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyLikes($first: Int, $after: String) {\n  myLikes(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        createdAt\n        meshi {\n          id\n          title\n          imageUrl\n          storeName\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    totalCount\n  }\n}"): (typeof documents)["query MyLikes($first: Int, $after: String) {\n  myLikes(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        createdAt\n        meshi {\n          id\n          title\n          imageUrl\n          storeName\n          municipality {\n            id\n            name\n          }\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n    likeCount\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    name\n    displayName\n    email\n    iconImageURL\n    description\n    twitterProfileUrl\n    firebaseUid\n    authProvider\n    createdAt\n    updatedAt\n    likeCount\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;