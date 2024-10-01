import { serve } from '@hono/node-server'
import { Redis } from 'ioredis'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/redis', async (c) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD ?? 'password',
  })
  const value = (await redis.get('test')) ?? 'Hello Redis!'
  await redis.set('test', `You last visited at ${new Date().toISOString()}`)
  return c.text(value ?? 'error')
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
