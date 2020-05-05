'use strict'

class AuthRegister {
  get rules () {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed', //confirmed verifica se o password é igual a um campo password_confirmation
    }
  }

  get messages() {
    return {
      //validation messages
      'name.required': 'O nome é obrigatório',
      'surname.required': 'O sobrenome é obrigatório',
      'email.required': 'O E-mail é obrigatório',
      'email.email': 'E-mail inválido',
      'email.unique': 'Este E-mail já existe',
      'password.required': 'A senha é obrigatória',
      'password.confirmed': 'As senhas não são iguais'
    }
  }

  
}

module.exports = AuthRegister
