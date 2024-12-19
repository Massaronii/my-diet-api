import fastify from 'fastify'
import { dietRoutes } from './routes/diet'

const server = fastify()

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
