'use strict'

const User = use('App/Models/User')

class UserController {
    async me({ response, auth }) {
        const userData = await auth.getUser()
        userData.roles = await userData.getRoles()

        return response.json(userData)
    }
}

module.exports = UserController
