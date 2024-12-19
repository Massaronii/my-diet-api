import fastify from 'fastify'
import { dietRoutes } from './routes/diet'
import { usersRoutes } from './routes/users'

const server = fastify()

server.register(usersRoutes, {
  prefix: 'users',
})

server.register(dietRoutes, {
  prefix: 'diet',
})

server.listen(
  {
    port: 3333,
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
