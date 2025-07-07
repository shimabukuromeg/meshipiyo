// fastify 導入した。
// 参考: https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-fastify
import fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { applyMiddleware } from 'graphql-middleware'
import { createSchema, createYoga } from 'graphql-yoga'
import { createContext } from './context'
import { resolvers } from './schema/resolvers.generated'
import { typeDefs } from './schema/typeDefs.generated'
import { logger } from './lib/logger'
import { graphqlLoggerPlugin } from './plugins/graphql-logger'

function main() {
  // This is the fastify instance you have created
  const app = fastify({ logger })

  // TODO: スキーマ読み込み
  const yoga = createYoga<{
    req: FastifyRequest
    reply: FastifyReply
  }>({
    schema: applyMiddleware(
      createSchema({
        typeDefs,
        resolvers,
      }),
    ),
    context: createContext,
    graphiql: true,
    plugins: [graphqlLoggerPlugin()],
    // Integrate Fastify logger
    logging: {
      debug: (...args) => {
        for (const arg of args) app.log.debug(arg)
      },
      info: (...args) => {
        for (const arg of args) app.log.info(arg)
      },
      warn: (...args) => {
        for (const arg of args) app.log.warn(arg)
      },
      error: (...args) => {
        for (const arg of args) app.log.error(arg)
      },
    },
  })

  app.route({
    // Bind to the Yoga's endpoint to avoid rendering on any path
    url: yoga.graphqlEndpoint,
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
      const response = await yoga.handleNodeRequest(req, {
        req,
        reply,
      })
      response.headers.forEach((value, key) => {
        reply.header(key, value)
      })

      reply.status(response.status)

      reply.send(response.body)

      return reply
    },
  })

  logger.info('starting http server')
  app.listen({ port: 44000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }
    logger.info(`server listening on ${address}`)
  })
}

main()
