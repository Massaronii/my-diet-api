import fastify from 'fastify'
import { dietRoutes } from './routes/diet'
import { usersRoutes } from './routes/users'
import { env } from './env'
import cookie from '@fastify/cookie'

const server = fastify()

server.addHook('onRequest', async (request) => {
  console.log(`Método: ${request.method}, Rota: ${request.url}`)
})
server.register(cookie)

server.register(usersRoutes, {
  prefix: 'users',
})

server.register(dietRoutes, {
  prefix: 'users/diet',
})

server.listen(
  {
    port: env.PORT,
  },
  (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server running at ${address}`)
  },
)

// interface IQuerystring {
//   username: string
//   password: string
// }

// interface IHeaders {
//   'h-Custom': string
// }

// interface IReply {
//   200: { success: boolean }
//   302: { url: string }
//   '4xx': { error: string }
// }
