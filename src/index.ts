import { serve } from '@hono/node-server'
import { Redis } from 'ioredis'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/redis', async (c) => {
  try {
    const config = {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD,
      // tls: {
      //   // Required for AWS ElastiCache
      //   rejectUnauthorized: false,
      // },
      connectTimeout: 10000, // 10 seconds
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    }
    console.log(config)
    const redis = new Redis(config)
    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })
    const value = (await redis.get('test')) ?? 'Hello Redis!'
    await redis.set('test', `You last visited at ${new Date().toISOString()}`)
    return c.text(value ?? 'error')
  } catch (e) {
    console.error(e)
    return c.text('Error connecting to Redis')
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
