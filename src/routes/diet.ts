import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function dietRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const searchSessionId = await knex('users')
        .where('sessionId', sessionId)
        .first()

      const searchDiets = await knex('diets')
        .where('user_id', searchSessionId.id)
        .select('*')

      return reply.status(200).send(searchDiets)
    },
  )

  server.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })

      const searchUser = await knex('users')
        .where('sessionId', sessionId)
        .first()

      if (!searchUser) {
        return reply.status(400).send('Usuário não encontrado')
      }

      const { name, description, isDiet } = createDietBodySchema.parse(
        request.body,
      )
      const createDiet = await knex('diets').insert({
        id: randomUUID(),
        name,
        description,
        is_diet: isDiet,
        user_id: searchUser.id,
      })

      if (!createDiet) {
        return reply.status(400).send('Erro ao criar dieta')
      }

      return reply.status(201).send()
    },
  )

  server.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const idSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = idSchema.parse(request.params)
      const { sessionId } = request.cookies

      const searchUser = await knex('users')
        .where('sessionId', sessionId)
        .first()

      if (!searchUser) {
        return reply.status(400).send('Sessão não encotrada')
      }

      const deleteDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .where('id', id)
        .first()
        .delete()

      if (!deleteDiet) {
        return reply.status(400).send('Erro ao deletar dieta')
      }

      return reply.status(200).send('dieta deletada com sucesso')
    },
  )

  server.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const idSchema = z.object({
        id: z.string().uuid(),
      })

      const { sessionId } = request.cookies

      const searchUser = await knex('users')
        .where('sessionId', sessionId)
        .first()

      const { id } = idSchema.parse(request.params)

      const searchDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .where('id', id)
        .first()

      if (!searchDiet) {
        return reply.status(400).send('Dieta não encontrada')
      }

      return reply.status(200).send(searchDiet)
    },
  )

  server.put(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const searchUser = await knex('users')
        .where('sessionId', sessionId)
        .first()

      const dietBodySchema = z.object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })

      const { name, description, isDiet, id } = dietBodySchema.parse(
        request.body,
      )

      const updateDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .where('id', id)
        .update({
          name,
          description,
          is_diet: isDiet,
        })

      return reply.status(200).send(updateDiet)
    },
  )

  server.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const searchUser = await knex('users')
        .where('sessionId', sessionId)
        .first()

      if (!searchUser) {
        return reply.status(400).send('Usuário não encontrado')
      }

      const sumTotalRegisterDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .count('id')

      const sumTotalIsDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .where('is_diet', true)
        .count('id')

      const sumTotalNotDiet = await knex('diets')
        .where('user_id', searchUser.id)
        .where('is_diet', false)
        .count('id')

      const diets = await knex('diets')
        .where('user_id', searchUser.id)
        .orderBy('created_at', 'asc')
        .select('is_diet')

      let currentSequence = 0
      let maxSequence = 0

      for (const diet of diets) {
        if (diet.is_diet === 1) {
          currentSequence++

          if (currentSequence > maxSequence) {
            maxSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      }
      return reply.status(200).send({
        maxSequence,
        sumTotalRegisterDiet,
        sumTotalIsDiet,
        sumTotalNotDiet,
      })
    },
  )
}
