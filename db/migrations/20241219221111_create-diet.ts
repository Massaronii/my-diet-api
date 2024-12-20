import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diets', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.boolean('is_diet').notNullable()
    table.uuid('user_id').notNullable()
    table.timestamps(true, true)
    table.foreign('user_id').references('users.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diets')
}
