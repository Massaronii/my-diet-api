import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function usersRoutes(server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    const test = await knex('users').select('*')

    return reply.status(200).send(test)
  })

  server.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const createUser = await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
    })

    if (createUser) {
      return reply.status(201).send()
    }

    return reply.status(400).send('Erro ao criar usuário')
  })

  server.delete('/:id', async (request, reply) => {
    const idUserSChema = z.object({
      id: z.string().nullable(),
    })

    const { id } = idUserSChema.parse(request.params)

    const deleteUser = await knex('users').where({ id }).del()

    if (deleteUser) {
      return reply.status(200).send()
    }

    return reply.status(400).send('Erro ao deletar usuário')
  })
}
