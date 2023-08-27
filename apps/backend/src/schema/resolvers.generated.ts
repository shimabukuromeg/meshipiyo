/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { Comment } from './comment/resolvers/Comment';
import    { Link } from './feed/resolvers/Link';
import    { postCommentOnLink as Mutation_postCommentOnLink } from './comment/resolvers/Mutation/postCommentOnLink';
import    { postLink as Mutation_postLink } from './feed/resolvers/Mutation/postLink';
import    { comment as Query_comment } from './comment/resolvers/Query/comment';
import    { feed as Query_feed } from './feed/resolvers/Query/feed';
import    { info as Query_info } from './info/resolvers/Query/info';
import    { link as Query_link } from './feed/resolvers/Query/link';
import    { user as Query_user } from './user/resolvers/Query/user';
import    { users as Query_users } from './user/resolvers/Query/users';
import    { User } from './user/resolvers/User';
    export const resolvers: Resolvers = {
      Query: { comment: Query_comment,feed: Query_feed,info: Query_info,link: Query_link,user: Query_user,users: Query_users },
      Mutation: { postCommentOnLink: Mutation_postCommentOnLink,postLink: Mutation_postLink },
      
      Comment: Comment,
Link: Link,
User: User
    }