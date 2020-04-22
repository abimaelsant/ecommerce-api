'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Role = use('Role') /** Usa apenas Role, porque no app.js aliases declarou ele, se não tivesse declarado lá tinha que usar Adonis/Acl/Role */

class RoleSeeder {
  async run () {
    //Cria cargo de admin
    await Role.create({
      name: 'Admin',
      slug: 'admin',
      description: 'Administrador do sistema'
    })
    
    //Cria o cargo de gerente
    await Role.create({
      name: 'Manager',
      slug: 'manager',
      description: 'gerente da loja'
    })

    //Cria o cargo de cliente
    await Role.create({
      name: 'Client',
      slug: 'client',
      description: 'Cliente da loja'
    })
  }
}

module.exports = RoleSeeder
