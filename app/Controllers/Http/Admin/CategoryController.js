'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category')
const Transformer = use('App/Transformers/Admin/CategoryTransformer')
/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index({ request, response, transform, pagination }) {
    try {
      const title = request.input('title')

      const query = Category.query()

      if (title)
        query.where('title', 'LIKE', `%${title}%`)

      let categories = await query.paginate(pagination.page, pagination.limit)

      categories = await transform.paginate(categories, Transformer)

      return response.json(categories)

    } catch (error) {
      return response.status(400).json({
        error: error.message,
        message: 'Erro ao consultar categorias'
      })
    }
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const { title, description, image_id } = request.all()

      const category = await Category.create({ title, description, image_id })

      return response.status(201).json(category)

    } catch (error) {
      return response.status(400).json({
        error: error.message, /** não é interessante enviar a mensagem de erro assim, pois hackers podem usar para saber qual driver, bd e etc está sendo usado */
        message: 'Erro ao cadastrar categoria'
      })
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {
    const category = await Category.findOrFail(id)

    return response.json(category)

  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const category = await Category.findOrFail(id)

    const { title, description, image_id } = request.all()

    category.merge({ title, description, image_id })

    await category.save()

    return response.json(category)
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const category = await Category.findOrFail(id)

    await category.delete()

    return response.noContent()

  }
}

module.exports = CategoryController
