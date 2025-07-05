import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Meshi_Mapper } from './meshi/schema.mappers';
import { Municipality_Mapper } from './municipality/schema.mappers';
import { User_Mapper } from './user/schema.mappers';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string | number; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: Date | string; output: Date | string; }
  DateTime: { input: Date | string; output: Date | string; }
};

export type Like = {
  __typename?: 'Like';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  meshi: Meshi;
  user: User;
};

export type LikeConnection = {
  __typename?: 'LikeConnection';
  edges: Array<LikeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LikeEdge = {
  __typename?: 'LikeEdge';
  cursor: Scalars['String']['output'];
  node: Like;
};

export type Meshi = {
  __typename?: 'Meshi';
  address: Scalars['String']['output'];
  articleId: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  isLiked: Scalars['Boolean']['output'];
  latitude: Scalars['Float']['output'];
  likeCount: Scalars['Int']['output'];
  longitude: Scalars['Float']['output'];
  municipality?: Maybe<Municipality>;
  publishedDate: Scalars['Date']['output'];
  siteUrl: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type MeshiConnection = {
  __typename?: 'MeshiConnection';
  edges: Array<MeshiEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MeshiEdge = {
  __typename?: 'MeshiEdge';
  cursor: Scalars['String']['output'];
  node: Meshi;
};

/** MicroCMSの画像 */
export type MicroCmsImage = {
  __typename?: 'MicroCmsImage';
  height?: Maybe<Scalars['Int']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type Municipality = {
  __typename?: 'Municipality';
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  meshis: Array<Maybe<Meshi>>;
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  likeMeshi: Like;
  unlikeMeshi: Scalars['Boolean']['output'];
  updateUser: User;
};


export type MutationlikeMeshiArgs = {
  meshiId: Scalars['ID']['input'];
};


export type MutationunlikeMeshiArgs = {
  meshiId: Scalars['ID']['input'];
};


export type MutationupdateUserArgs = {
  input: UpdateUserInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  meshi?: Maybe<Meshi>;
  meshis: MeshiConnection;
  municipalities: Array<Municipality>;
  municipality?: Maybe<Municipality>;
  myLikes: LikeConnection;
  user: User;
  users: Array<User>;
};


export type QuerymeshiArgs = {
  id: Scalars['ID']['input'];
};


export type QuerymeshisArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QuerymunicipalityArgs = {
  id: Scalars['ID']['input'];
};


export type QuerymyLikesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryuserArgs = {
  id: Scalars['ID']['input'];
};

export type UpdateUserInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  iconImageURL?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  twitterProfileUrl?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  authProvider: Array<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firebaseUid?: Maybe<Scalars['String']['output']>;
  iconImageURL?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  likeCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  twitterProfileUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Like: ResolverTypeWrapper<Omit<Like, 'meshi' | 'user'> & { meshi: ResolversTypes['Meshi'], user: ResolversTypes['User'] }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  LikeConnection: ResolverTypeWrapper<Omit<LikeConnection, 'edges'> & { edges: Array<ResolversTypes['LikeEdge']> }>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LikeEdge: ResolverTypeWrapper<Omit<LikeEdge, 'node'> & { node: ResolversTypes['Like'] }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Meshi: ResolverTypeWrapper<Meshi_Mapper>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  MeshiConnection: ResolverTypeWrapper<Omit<MeshiConnection, 'edges'> & { edges: Array<ResolversTypes['MeshiEdge']> }>;
  MeshiEdge: ResolverTypeWrapper<Omit<MeshiEdge, 'node'> & { node: ResolversTypes['Meshi'] }>;
  MicroCmsImage: ResolverTypeWrapper<MicroCmsImage>;
  Municipality: ResolverTypeWrapper<Municipality_Mapper>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User_Mapper>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  Like: Omit<Like, 'meshi' | 'user'> & { meshi: ResolversParentTypes['Meshi'], user: ResolversParentTypes['User'] };
  ID: Scalars['ID']['output'];
  LikeConnection: Omit<LikeConnection, 'edges'> & { edges: Array<ResolversParentTypes['LikeEdge']> };
  Int: Scalars['Int']['output'];
  LikeEdge: Omit<LikeEdge, 'node'> & { node: ResolversParentTypes['Like'] };
  String: Scalars['String']['output'];
  Meshi: Meshi_Mapper;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  MeshiConnection: Omit<MeshiConnection, 'edges'> & { edges: Array<ResolversParentTypes['MeshiEdge']> };
  MeshiEdge: Omit<MeshiEdge, 'node'> & { node: ResolversParentTypes['Meshi'] };
  MicroCmsImage: MicroCmsImage;
  Municipality: Municipality_Mapper;
  Mutation: {};
  PageInfo: PageInfo;
  Query: {};
  UpdateUserInput: UpdateUserInput;
  User: User_Mapper;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type LikeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Like'] = ResolversParentTypes['Like']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meshi?: Resolver<ResolversTypes['Meshi'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LikeConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['LikeConnection'] = ResolversParentTypes['LikeConnection']> = {
  edges?: Resolver<Array<ResolversTypes['LikeEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LikeEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['LikeEdge'] = ResolversParentTypes['LikeEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Like'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeshiResolvers<ContextType = any, ParentType extends ResolversParentTypes['Meshi'] = ResolversParentTypes['Meshi']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  articleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isLiked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType>;
  publishedDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  siteUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  storeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeshiConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MeshiConnection'] = ResolversParentTypes['MeshiConnection']> = {
  edges?: Resolver<Array<ResolversTypes['MeshiEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeshiEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MeshiEdge'] = ResolversParentTypes['MeshiEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Meshi'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MicroCmsImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['MicroCmsImage'] = ResolversParentTypes['MicroCmsImage']> = {
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MunicipalityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Municipality'] = ResolversParentTypes['Municipality']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meshis?: Resolver<Array<Maybe<ResolversTypes['Meshi']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  likeMeshi?: Resolver<ResolversTypes['Like'], ParentType, ContextType, RequireFields<MutationlikeMeshiArgs, 'meshiId'>>;
  unlikeMeshi?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationunlikeMeshiArgs, 'meshiId'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationupdateUserArgs, 'input'>>;
};

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  meshi?: Resolver<Maybe<ResolversTypes['Meshi']>, ParentType, ContextType, RequireFields<QuerymeshiArgs, 'id'>>;
  meshis?: Resolver<ResolversTypes['MeshiConnection'], ParentType, ContextType, RequireFields<QuerymeshisArgs, 'first'>>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QuerymunicipalityArgs, 'id'>>;
  myLikes?: Resolver<ResolversTypes['LikeConnection'], ParentType, ContextType, RequireFields<QuerymyLikesArgs, 'first'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryuserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  authProvider?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  iconImageURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  twitterProfileUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  Like?: LikeResolvers<ContextType>;
  LikeConnection?: LikeConnectionResolvers<ContextType>;
  LikeEdge?: LikeEdgeResolvers<ContextType>;
  Meshi?: MeshiResolvers<ContextType>;
  MeshiConnection?: MeshiConnectionResolvers<ContextType>;
  MeshiEdge?: MeshiEdgeResolvers<ContextType>;
  MicroCmsImage?: MicroCmsImageResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

