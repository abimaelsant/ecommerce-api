'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const Role = use('Role')
const Ws = use('Ws')
class AuthController {

    async register({ request, response }) {
        /** cria transação*/
        const trx = await Database.beginTransaction()
        try {
            const { name, surname, email, password } = request.all()
            
            const user = await User.create({ name, surname, email, password }, trx)

            const userRole = await Role.findBy('slug', 'client')
            /** passa null, porque o método attach espera um callback, mas como não precisa do callback nesta situação, passa null */
            await user.roles().attach([userRole.id], null, trx)

            await trx.commit()

            const topic = Ws.getChannel('notifications').topic('notifications')
            
            if(topic) {
                console.log("entrou")
                topic.broadcast('new:user', { message: "Novo usuário foi criado" })
            }

            return response.status(201).json({ data: user })
        } catch (error) {
            await trx.rollback()
            return response.status(400).json({ message: 'Erro ao realizar cadastro', error: error.message })
        }
    }

    async login({ request, response, auth }) {
        const { email, password } = request.all()

        let data = await auth.withRefreshToken().attempt(email, password)

        return response.json({ data })
    }

    async refresh({ request, response, auth }) {
        let refreshToken = request.input('refresh_token')
        
        if(!refreshToken) {
            refreshToken = request.header('refresh_token')
        }
        /** usa o newRefreshToken() para gerar um novo refreshToken e invalidar o anterior refreshToken e o generateForRefreshToken gera o novo token */
        const user = await auth.newRefreshToken().generateForRefreshToken(refreshToken)

        return response.json({ data: user })
    }

    async logout({ request, response, auth }) {
        let refreshToken = request.input('refresh_token')
        
        if(!refreshToken) {
            refreshToken = request.header('refresh_token')
        }

        await auth.authenticator('jwt').revokeTokens([refreshToken], true)

        return response.noContent()
    }

    async forgot({ request, response }) {
        //
    }

    async remember({ request, response }) {
        //
    }

    async reset({ request, response }) {
        //
    }
}

module.exports = AuthController
