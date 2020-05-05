'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Service/Coupon/CouponService')
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ response, pagination }) {

    const code = request.input('code')

    const query = Coupon.query()

    if (code)
      query.where('code', 'LIKE', `%${code}%`)

    const coupons = await query.paginate(pagination.page, pagination.limit)

    return response.json(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction()
    /**
     * 1 - produto - pode ser usado apenas em produtos específicos
     * 2 - clientes - pode ser usando apenas por produtos específicos
     * 3 - clientes e produtos - pode ser usado apenas em produtos e clientes específicos
     * 4 - pode ser utilizado por qualquer cliente em qualquer produto 
     */

    let can_use_for = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only(['code', 'discount', 'valid_from', 'valid_until', 'quantity', 'type', 'recursive'])

      const { users, products } = request.only(['users', 'products'])

      const coupon = await Coupon.create(couponData, trx)

      //service layer
      const service = new Service(coupon, trx)

      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if (can_use_for.product && can_use_for.client)
        coupon.can_use_for = 'product_client'
      else if (can_use_for.product && !can_use_for.client)
        coupon.can_use_for = 'product'
      else if (!can_use_for.product && can_use_for.client)
        coupon.can_use_for = 'client'
      else
        coupon.can_use_for = 'all'

      await coupon.save(trx)

      await trx.commit()

      return response.status(201).json(coupon)
    } catch (error) {
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possível criar o cupom no momento'
      })
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response }) {
    const coupon = await Coupon.findOrFail(id)

    return response.json(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction()

    const coupon = await Coupon.findOrFail(id)

    let can_use_for = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only(['code', 'discount', 'valid_from', 'valid_until', 'quantity', 'type', 'recursive'])

      coupon.merge(couponData)

      const { users, products } = request.only(['users', 'products'])

      const service = new Service(coupon, trx)

      //service layer
      const service = new Service(coupon, trx)

      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if (can_use_for.product && can_use_for.client)
        coupon.can_use_for = 'product_client'
      else if (can_use_for.product && !can_use_for.client)
        coupon.can_use_for = 'product'
      else if (!can_use_for.product && can_use_for.client)
        coupon.can_use_for = 'client'
      else
        coupon.can_use_for = 'all'

      await coupon.save(trx)

      await trx.commit()

      return response.json(coupon)

    } catch (error) {
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possível atualizar o cupom no momento'
      })
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {

    const trx = await Database.beginTransaction()

    const coupon = await Coupon.findOrFail(id)

    try {
      //desfaz o relacionamento com o coupon que vai excluir
      await coupon.products().detach([], trx)

      await coupon.orders().detach([], trx)

      await coupon.users().detach([], trx)

      await coupon.delete(trx)

      await trx.commit()

      return response.noContent()

    } catch (error) {

      await trx.rollback()

      return response.status(400).json({
        message: 'Não foi possível deletar este cupom no momento'
      })
    }
  }
}

module.exports = CouponController
