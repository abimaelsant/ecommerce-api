'use strict'

class AdminStoreUser {
  get rules () {
    let userId = this.ctx.params.id
    let rule = ''
    // se tiver o id significa que está atualizando
    if(userId) {
      rule = `unique:users,email,id,${userId}|email`
    } else {
      rule = 'unique:users,email|required|email'
    }
    return {
      // validation rules
      email: rule,
      image_id: 'exists:images,id' //o exists foi criado nos start/hooks.js
    }
  }
}

module.exports = AdminStoreUser
