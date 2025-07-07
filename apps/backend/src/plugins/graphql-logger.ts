import { Plugin } from '@envelop/core'
import { createRequestLogger } from '../lib/logger'
import { v4 as uuidv4 } from 'uuid'

export const graphqlLoggerPlugin = (): Plugin => {
  return {
    onRequestParse() {
      return {
        onRequestParseDone(context) {
          const requestId = uuidv4()
          const requestLogger = createRequestLogger(requestId, context.contextValue?.user?.id)
          
          context.contextValue = {
            ...context.contextValue,
            requestId,
            logger: requestLogger,
          }
        },
      }
    },
    onExecute() {
      return {
        onExecuteDone(context) {
          const { args, result } = context
          const { document, contextValue } = args
          const { logger } = contextValue
          
          if (!logger) return
          
          const operationName = document.definitions.find(
            def => def.kind === 'OperationDefinition'
          )?.name?.value || 'Unknown'
          
          const variables = args.variableValues || {}
          const hasErrors = result.errors && result.errors.length > 0
          
          if (hasErrors) {
            logger.error({
              operationName,
              variables,
              errors: result.errors,
            }, `GraphQL operation failed: ${operationName}`)
          } else {
            logger.info({
              operationName,
              variables,
            }, `GraphQL operation completed: ${operationName}`)
          }
        },
      }
    },
  }
}