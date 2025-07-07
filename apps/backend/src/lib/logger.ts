import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = (process.env.LOG_LEVEL as pino.Level) || (isDevelopment ? 'debug' : 'info')

const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss',
          singleLine: true,
        },
      }
    : undefined,
  formatters: {
    level(label) {
      return { level: label }
    },
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
})

export { logger }

export function createChildLogger(context: Record<string, any>) {
  return logger.child(context)
}

export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId,
  })
}