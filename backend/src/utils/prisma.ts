import { PrismaClient, Prisma } from '@prisma/client';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500; // 1.5 seconds base delay

// Create base Prisma client with connection pool limits
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  return client;
};

// Prevent multiple instances in development (hot reload)
declare const globalThis: {
  prismaGlobal: PrismaClient;
} & typeof global;

const basePrisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = basePrisma;

// Extended client with query retry logic using $extends
const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      let lastError: any;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await query(args);
        } catch (error: any) {
          lastError = error;

          // Check for connection/pool errors
          const errorMsg = error.message || '';
          const isConnectionError =
            errorMsg.includes('ConnectionReset') ||
            errorMsg.includes('forcibly closed') ||
            errorMsg.includes('10054') ||
            errorMsg.includes('MaxClientsReached') ||
            errorMsg.includes('MaxClientsInSessionMode') ||
            errorMsg.includes('max clients reached') ||
            errorMsg.includes('connection pool') ||
            errorMsg.includes('pool_timeout') ||
            errorMsg.includes('FATAL') ||
            errorMsg.includes('Error querying the database') ||
            error.code === 'P1001' || // Connection error
            error.code === 'P1002' || // Timeout
            error.code === 'P1008' || // Operations timed out
            error.code === 'P1017' || // Server closed connection
            error.code === 'P2024';   // Connection pool timeout

          if (isConnectionError && attempt < MAX_RETRIES) {
            console.warn(`⚠️ DB connection error (${model}.${operation}), retry ${attempt}/${MAX_RETRIES}...`);
            // Exponential back-off: 1.5s, 3s, 4.5s, 6s
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));

            // Try to reconnect
            try {
              await basePrisma.$disconnect();
              await basePrisma.$connect();
            } catch (reconnectError) {
              // Ignore reconnect errors, the next query attempt will try again
            }
            continue;
          }

          throw error;
        }
      }

      throw lastError;
    },
  },
});

// Eagerly connect to the database. Callers can await connectDB() to guarantee
// the engine is ready before serving requests.
export async function connectDB(retries = MAX_RETRIES): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await basePrisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error: any) {
      console.warn(`⚠️ DB connect attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
      } else {
        console.error('❌ Could not connect to the database after retries.');
        throw error;
      }
    }
  }
}

// Fire-and-forget initial connect so the engine starts warming up immediately.
connectDB().catch(() => { });

// Handle disconnection gracefully
process.on('beforeExit', async () => {
  await basePrisma.$disconnect();
});

export default prisma;
