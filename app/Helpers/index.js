'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 * Generate random string
 * 
 * @param { int } length - 0 tamanho da string que você quer gerar
 * @return { string } uma string randômica do tamanho de length
 */

const str_random = async ( length = 40 ) => {
    let string = ''

    let len = string.length
    
    if(len < length) {
        let size = length - len
        let bytes = await crypto.randomBytes(size)
        let buffer = Buffer.from(bytes)
        string += buffer
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substr(0, size)
    }

    return string
}

/**
 * Move um único arquivo para o caminho especificado
 * então 'public/uploads' será utilizado.
 * @param { FileJar } file o arquivo a ser gerenciado (FileJar é uma classe do adonis que trabalha com upload de arquivos, por isso usa que o arquivo a ser salvo é desse tipo)
 * @param { string } path o caminho  para onde o arquivo deve ser movido
 * @return { ObjectFileJar }
 */

const manage_single_upload = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')

    //gera nome aleatório
    const random_name = await str_random(30)
    let filename = `${ new Date().getTime() }-${ random_name }-${ fileJar.subtype }`

    //renomeia o arquivo e move ele para o path

    await fileJar.move(path, {
        name: filename
    })

    return fileJar
}

/**
 * Move múltiplos arquivos para o caminho especificado
 * então 'public/uploads' será utilizado.
 * @param { FileJar } file os arquivos a ser gerenciados
 * @param { string } path o caminho  para onde o arquivo deve ser movido
 * @return { Object }
 */

const manage_multiple_uploads = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')
    let successes = [], errors = []

    await Promise.all(
        fileJar.files.map( async file => {
            let random_name = await str_random(30)
            let filename = `${ new Date().getTime() }-${ random_name }-${ file.subtype }`

            //move o arquivo
            await file.move(path, {
                name: filename
            })

            //verificamos se moveu
            if(file.moved()) 
                successes.push(file)
            else 
                errors.push(file.error())
        })
    )

    return { successes, errors }
}

module.exports = {
    str_random,
    manage_single_upload,
    manage_multiple_uploads
}