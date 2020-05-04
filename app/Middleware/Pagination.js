'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {
    // call next to advance the request

    if(ctx.request.method() === 'GET') {
      let page = parseInt(ctx.request.input('page'))
      let limit = parseInt(ctx.request.input('limit'))
      
      if(isNaN(page) && isNaN(limit)) {
        page = undefined,
        limit = undefined
      }
      //atrivui os valores passados via get para a propriedade pagination do objeto ctx (context)
      ctx.pagination = {
        page,
        limit
      }

      let perpage = parseInt(ctx.request.input('perpage'))
      if(perpage) {
        if(isNaN(perpage)) perpage = undefined
        ctx.pagination.limit = perpage
      } 
    }
    await next()
  }
}

module.exports = Pagination
