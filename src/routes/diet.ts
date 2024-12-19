import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function dietRoutes(server: FastifyInstance) {
  server.get('/', async () => {
    const test = await knex('users').select('*')

    return test
  })
}
