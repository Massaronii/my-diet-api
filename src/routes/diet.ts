import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function dietRoutes(server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    const idUserSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = idUserSchema.parse(request.query)

    const searchDiets = await knex('diets').where('user_id', userId).select('*')

    return reply.status(200).send(searchDiets)
  })

  server.post('/:userId', async (request, reply) => {
    const idUserSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = idUserSchema.parse(request.params)

    if (!userId) {
      return reply.status(400).send('Necessário um usuário para criar dieta')
    }

    const createDietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, isDiet } = createDietBodySchema.parse(
      request.body,
    )
    const createDiet = await knex('diets').insert({
      id: randomUUID(),
      name,
      description,
      is_diet: isDiet,
      user_id: userId,
    })

    if (!createDiet) {
      return reply.status(400).send('Erro ao criar dieta')
    }

    return reply.status(201).send()
  })

  server.delete('/:id', async (request, reply) => {
    const idSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = idSchema.parse(request.params)

    const userIdSchema = z.object({
      userId: z.string().uuid(),
      name: z.string(),
      password: z.string(),
      email: z.string(),
    })

    const { userId, name, email, password } = userIdSchema.parse(request.body)

    const searchUser = await knex('users')
      .where('id', userId)
      .where('name', name)
      .where('email', email)
      .where('password', password)
      .first()

    if (!searchUser) {
      return reply.status(400).send('Usuário não encontrado')
    }

    const deleteDiet = await knex('diets').where({ id }).del()

    if (!deleteDiet) {
      return reply.status(400).send('Erro ao deletar dieta')
    }

    return reply.status(200).send('dieta deletada com sucesso')
  })

  server.get('/:id', async (request, reply) => {
    const idSchema = z.object({
      id: z.string().uuid(),
    })

    const userIdSchema = z.object({
      userId: z.string().uuid(),
      name: z.string(),
      password: z.string(),
      email: z.string(),
    })

    const { userId } = userIdSchema.parse(request.body)

    const searchUser = await knex('users').where('id', userId).first()

    if (!searchUser) {
      return reply.status(400).send('Usuário não encontrado')
    }

    const { id } = idSchema.parse(request.params)

    const searchDiet = await knex('diets')
      .where('user_id', userId)
      .where('id', id)
      .first()

    if (!searchDiet) {
      return reply.status(400).send('Dieta não encontrada')
    }

    return reply.status(200).send(searchDiet)
  })

  server.put('/:id', async (request, reply) => {
    const idSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = idSchema.parse(request.params)

    const dietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
      userId: z.string().uuid(),
    })

    const { name, description, isDiet, userId } = dietBodySchema.parse(
      request.body,
    )

    const updateDiet = await knex('diets')
      .where('user_id', userId)
      .where('id', id)
      .update({
        name,
        description,
        is_diet: isDiet,
      })

    return reply.status(200).send(updateDiet)
  })

  server.get('/:userId/metrics', async (request, response) => {
    const idSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = idSchema.parse(request.params)

    const sumTotalRegisterDiet = await knex('diets')
      .where('user_id', userId)
      .count('id')

    const sumTotalIsDiet = await knex('diets')
      .where('user_id', userId)
      .where('is_diet', true)
      .count('id')

    const sumTotalNotDiet = await knex('diets')
      .where('user_id', userId)
      .where('is_diet', false)
      .count('id')

    const diets = await knex('diets')
      .where('user_id', userId)
      .orderBy('timestamps')
      .select('is_diet')

    let totalSequence = 0

    for (const diet of diets) {
      const isDiet = diet.is_diet ? totalSequence++ : totalSequence--
      console.log(isDiet)
    }

    return response.status(200).send({
      totalSequence,
      sumTotalRegisterDiet,
      sumTotalIsDiet,
      sumTotalNotDiet,
    })
  })
}
