'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Role')
const User = use('App/Models/User')

class ClientSeeder {
  async run () {
    const role = await Role.findBy('slug', 'client')
    /** passando o model de User para essa Factory, vai referenciar o blueprint de User no arquivo de Factory */
    const clients = await Factory.model('App/Models/User').createMany(30)
  
    await Promise.all(clients.map( async (client) => {
      /** cria um relacionamento, já que no model de User criou um relacionamento entre o User e o Role dentro do Traits */
      await client.roles().attach([role.id])
    }))

    const user = await User.create({ 
      name: 'Abimael',
      surname: 'Santiago',
      email: 'abimaelsv6@gmail.com',
      password: 'secret'
    })

    const adminRole = await Role.findBy('slug', 'admin')

    await user.roles().attach([adminRole.id])
  } 
}

module.exports = ClientSeeder
