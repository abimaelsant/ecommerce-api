'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User')

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination }) {
    
    const name = request.input('name')

    const query = User.query()

    if(name) {
      query
        .where('name', 'LIKE', `%${ name }%` )
        .orWhere('surname', 'LIKE', `%${ name }%` )
        .orWhere('email', 'LIKE', `%${ name }%` )
    }

    const users = await query.paginate(pagination.page, pagination.limit)

    return response.json(users)
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])

      const user = await User.create(userData)
  
      return response.status(201).json(user)

    } catch (error) {
      return response
        .status(400)
        .json({
          error: error.message,
          message: 'Erro ao cadastrar usuário' 
        })
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, response }) {
    
    const user = await User.findOrFail(id)

    return response.json(user)
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {
    const user = await User.findOrFail(id)

    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])

      user.merge(userData)

      await user.save()

      return response.json(user)

    } catch (error) {
      return response
        .status(400)
        .json({
          error: error.message,
          message: 'Erro ao atualizar o usuário' 
        })
    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const user = await User.findOrFail(id)

    try {
      await user.delete()

      return response.noContent()

    } catch (error) {
      return response
        .status(400)
        .json({
          error: error.message,
          message: 'Erro ao deletar o usuário' 
        })
    }
  }
}

module.exports = UserController
