import { Request, Response, NextFunction } from 'express'
import { sentryObservability } from '../config/sentry'

export function sentryUserContext(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Se existe um usuário autenticado na requisição
    if (req.userId) {
      sentryObservability.setUserContext({
        id: req.userId.toString()
      })
    }

    // Adiciona informações da requisição como contexto
    sentryObservability.setExtra('request_info', {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    })

    next()
  } catch (error) {
    sentryObservability.captureException(error as Error, {
      component: 'sentry-user-context-middleware'
    })
    next()
  }
}

export function withSentryObservability(
  controllerName: string,
  controller: (req: Request, res: Response, next?: NextFunction) => Promise<Response> | Response
) {
  return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
    return sentryObservability.startSpan(
      { 
        name: `${controllerName}.${req.method}.${req.route?.path || req.url}`,
        op: 'controller'
      },
      async () => {
        try {
          // Adiciona tags específicas da operação
          sentryObservability.setTags({
            controller: controllerName,
            method: req.method,
            route: req.route?.path || req.url
          })

          return await controller(req, res, next)
        } catch (error) {
          // Captura erros do controller
          sentryObservability.captureException(error as Error, {
            controller: controllerName,
            route: req.route?.path || req.url,
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params
          })
          
          // Re-throw o erro para que seja tratado pelo error handler
          throw error
        }
      }
    )
  }
}

export function trackOperation(operationName: string) {
  return function <T extends unknown[], R>(
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R> | R>
  ) {
    const originalMethod = descriptor.value

    if (!originalMethod) {
      return descriptor
    }

    descriptor.value = async function (...args: T): Promise<R> {
      return sentryObservability.startSpan(
        { name: operationName, op: 'operation' },
        async () => {
          try {
            return await originalMethod.apply(this, args)
          } catch (error) {
            sentryObservability.captureException(error as Error, {
              operation: operationName
            })
            throw error
          }
        }
      )
    }

    return descriptor
  }
}
