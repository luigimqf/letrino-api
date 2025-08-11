import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { Express, Request, Response, NextFunction } from 'express'
import { env } from './enviroment'

interface SentryConfig {
  dsn?: string
  environment: string
  release?: string
  tracesSampleRate: number
  profilesSampleRate: number
}

class SentryObservability {
  private initialized = false
  
  public init(config?: Partial<SentryConfig>): void {
    if (this.initialized || !env.SENTRY_DSN) {
      return
    }

    const defaultConfig: Sentry.NodeOptions = {
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        nodeProfilingIntegration(),
      ],
    }

    const finalConfig: Sentry.NodeOptions = {
      ...defaultConfig,
      ...config,
    }

    Sentry.init(finalConfig)
    this.initialized = true

    console.log(`🔍 Sentry initialized for environment: ${finalConfig.environment}`)
  }

  public setupExpressMiddlewares(): void {
    if (!this.initialized) {
      return
    }

    console.log('🔍 Sentry Express middlewares configured automatically')
  }

  public setupErrorHandler(app: Express): void {
    if (!this.initialized) {
      return
    }

    // Error handler personalizado que integra com o Sentry
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      // Captura o erro no Sentry
      Sentry.captureException(error, {
        extra: {
          url: req.url,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params,
        },
        tags: {
          component: 'express-error-handler'
        }
      })

      // Continua com o handling normal do erro
      next(error)
    })
  }

  public captureException(error: Error, extra?: Record<string, unknown>): string | undefined {
    if (!this.initialized) {
      console.error('Sentry not initialized:', error)
      return undefined
    }

    return Sentry.captureException(error, {
      extra,
      tags: {
        component: 'manual-capture'
      }
    })
  }

  public captureMessage(message: string, level: Sentry.SeverityLevel = 'info', extra?: Record<string, unknown>): string | undefined {
    if (!this.initialized) {
      console.log(`[${level.toUpperCase()}] ${message}`, extra)
      return undefined
    }

    return Sentry.captureMessage(message, {
      level,
      extra,
      tags: {
        component: 'manual-capture'
      }
    })
  }

  public setUserContext(user: { id: string; email?: string; username?: string }): void {
    if (!this.initialized) {
      return
    }

    Sentry.setUser(user)
  }

  public setTags(tags: Record<string, string>): void {
    if (!this.initialized) {
      return
    }

    Sentry.setTags(tags)
  }

  public setExtra(key: string, value: unknown): void {
    if (!this.initialized) {
      return
    }

    Sentry.setExtra(key, value)
  }

  public startSpan<T>(options: { name: string; op: string }, callback: (span: Sentry.Span | undefined) => T): T {
    if (!this.initialized) {
      return callback(undefined)
    }

    return Sentry.startSpan(options, callback)
  }

  public isInitialized(): boolean {
    return this.initialized
  }
}

export const sentryObservability = new SentryObservability()

export { Sentry }
