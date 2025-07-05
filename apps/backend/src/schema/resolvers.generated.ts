/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { me as Query_me } from './user/resolvers/Query/me';
import    { meshi as Query_meshi } from './meshi/resolvers/Query/meshi';
import    { meshis as Query_meshis } from './meshi/resolvers/Query/meshis';
import    { municipalities as Query_municipalities } from './municipality/resolvers/Query/municipalities';
import    { municipality as Query_municipality } from './municipality/resolvers/Query/municipality';
import    { myLikes as Query_myLikes } from './like/resolvers/Query/myLikes';
import    { user as Query_user } from './user/resolvers/Query/user';
import    { users as Query_users } from './user/resolvers/Query/users';
import    { likeMeshi as Mutation_likeMeshi } from './like/resolvers/Mutation/likeMeshi';
import    { unlikeMeshi as Mutation_unlikeMeshi } from './like/resolvers/Mutation/unlikeMeshi';
import    { updateUser as Mutation_updateUser } from './user/resolvers/Mutation/updateUser';
import    { Like } from './like/resolvers/Like';
import    { LikeConnection } from './like/resolvers/LikeConnection';
import    { LikeEdge } from './like/resolvers/LikeEdge';
import    { Meshi as meshi_Meshi } from './meshi/resolvers/Meshi';
import    { Meshi as like_Meshi } from './like/resolvers/Meshi';
import    { MeshiConnection } from './meshi/resolvers/MeshiConnection';
import    { MeshiEdge } from './meshi/resolvers/MeshiEdge';
import    { MicroCmsImage } from './base/resolvers/MicroCmsImage';
import    { Municipality } from './municipality/resolvers/Municipality';
import    { PageInfo } from './meshi/resolvers/PageInfo';
import    { User } from './user/resolvers/User';
import    { DateResolver,DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { me: Query_me,meshi: Query_meshi,meshis: Query_meshis,municipalities: Query_municipalities,municipality: Query_municipality,myLikes: Query_myLikes,user: Query_user,users: Query_users },
      Mutation: { likeMeshi: Mutation_likeMeshi,unlikeMeshi: Mutation_unlikeMeshi,updateUser: Mutation_updateUser },
      
      Like: Like,
LikeConnection: LikeConnection,
LikeEdge: LikeEdge,
Meshi: { ...meshi_Meshi,...like_Meshi },
MeshiConnection: MeshiConnection,
MeshiEdge: MeshiEdge,
MicroCmsImage: MicroCmsImage,
Municipality: Municipality,
PageInfo: PageInfo,
User: User,
Date: DateResolver,
DateTime: DateTimeResolver
    }