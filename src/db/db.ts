import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Prisma will fail to connect.")
  }
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
