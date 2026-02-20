import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const baseClient = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalThis.prisma = baseClient

const MAX_RETRIES = 5
const RETRY_DELAY = 1000

const client = baseClient.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await query(args)
        } catch (error: unknown) {
          lastError = error as Error

          // Check for connection reset errors including 10054
          const errorMessage = (error as Error).message || '';
          const isConnectionError =
            errorMessage.includes('ConnectionReset') ||
            errorMessage.includes('forcibly closed') ||
            error.message?.includes('connection') ||
            error.message?.includes('10054') ||
            error.code === 'P1001' ||
            error.code === 'P1002' ||
            error.code === 'P1017' ||
            error.code === '10054';

          if (isConnectionError && attempt < MAX_RETRIES) {
            console.warn(`⚠️ DB query failed (${model}.${operation}), retrying ${attempt}/${MAX_RETRIES}...`)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))

            // Try to reconnect
            try {
              await baseClient.$disconnect()
              await baseClient.$connect()
            } catch (reconnectError) {
              // Ignore reconnect errors
            }
            continue
          }

          throw error
        }
      }

      throw lastError
    },
  },
})

export default client as unknown as PrismaClient
