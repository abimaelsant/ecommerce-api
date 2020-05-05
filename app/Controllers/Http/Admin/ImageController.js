'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')
const Helpers = use('Helpers')
const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, pagination }) {
    const images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    return response.json(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      //captura uma image ou mais do request
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      // retorno pra usuário
      let images = []

      //caso seja apenas um arquivo chama o Helper manage_single_upload

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)
        if (file.moved()) {
          const image = await Image.create({ path: file.fileName, size: file.size, original_name: file.clientName, extension: file.subtype })
          images.push(image)

          return response.status(201).json({ successes: images, errors: {} })
        }

        return response.status(400).json({ message: 'Não foi possível processar esta imagem no momento' })
      }

      //caso seja mais de um arquivo chama o Helper manage_multiple_uploads

      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({ path: file.fileName, size: file.size, original_name: file.clientName, extension: file.subtype })

          images.push(image)
        })
      )

      return response.status(201).json({ successes: images, errors: files.errors })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
        message: 'Não foi possível processar a sua solicitação'
      })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)

    return response.json(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)

    try {
      image.merge(request.only(['original_name']))
      await image.save()
      return response.json(image)
    } catch (error) {
      return response.status(400).json({
        message: 'Não foi possível atualizar esta imagem no momento'
      })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)

    try {
      let filePath = Helpers.publicPath(`uploads/${image.path}`)
      await fs.unlinkSync(filePath)
      
      await image.delete()
      
      return response.noContent()
    } catch (error) {
      return response.status(400).json({
        message: 'Não foi possível deletar esta imagem no momento'
      })
    }
  }
}

module.exports = ImageController
