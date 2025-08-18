import type { Plugin } from 'graphql-yoga'
import type { ExecutionResult, DefinitionNode, OperationDefinitionNode } from 'graphql'
import { v4 as uuidv4 } from 'uuid'
import { createRequestLogger } from '../lib/logger'

interface LoggerContext {
  requestId?: string
  logger?: ReturnType<typeof createRequestLogger>
  user?: {
    id?: string
  }
}

function isOperationDefinition(def: DefinitionNode): def is OperationDefinitionNode {
  return def.kind === 'OperationDefinition'
}

function isExecutionResult(result: unknown): result is ExecutionResult {
  return typeof result === 'object' && result !== null && !(Symbol.asyncIterator in result)
}

export const graphqlLoggerPlugin = (): Plugin<LoggerContext> => {
  return {
    onExecute({ args }) {
      const requestId = uuidv4()
      const userId = args.contextValue?.user?.id
      const requestLogger = createRequestLogger(requestId, userId)
      
      // Add logger to context
      args.contextValue = {
        ...args.contextValue,
        requestId,
        logger: requestLogger,
      }
      
      return {
        onExecuteDone({ args, result }) {
          const { contextValue } = args
          const { logger } = contextValue
          
          if (!logger) return
          
          // Only log for non-streaming responses
          if (!isExecutionResult(result)) return
          
          const document = args.document
          const operationName = 
            document.definitions.find(isOperationDefinition)?.name?.value || 'Unknown'
          
          const variables = args.variableValues || {}
          const hasErrors = result.errors && result.errors.length > 0
          
          if (hasErrors) {
            logger.error(
              {
                operationName,
                variables,
                errors: result.errors,
              },
              `GraphQL operation failed: ${operationName}`,
            )
          } else {
            logger.info(
              {
                operationName,
                variables,
              },
              `GraphQL operation completed: ${operationName}`,
            )
          }
        },
      }
    },
  }
}