import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function usersRoutes(server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    const searchUsers = await knex('users').select('*')

    if (!searchUsers) {
      return reply.status(400).send('Usuários não encontrados')
    }

    const users = searchUsers.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })

    return reply.status(200).send(users)
  })

  server.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        maxAge: 1000 * 60 * 24 * 7,
      })
    }

    const createUser = await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
      sessionId,
    })

    if (!createUser) {
      return reply.status(400).send('Erro ao criar usuário')
    }

    return reply.status(201).send()
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

  server.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    if (!email || !password) {
      return reply.status(400).send('Email e/ou senha inválidos')
    }

    const searchUser = await knex('users')
      .where('email', email)
      .where('password', password)
      .first()

    if (!searchUser) {
      return reply.status(400).send('Usuário não encontrado')
    }

    reply.setCookie('sessionId', searchUser.sessionId, {
      maxAge: 1000 * 60 * 24 * 7,
    })

    return reply.status(200).send('login realizado com sucesso')
  })
}
