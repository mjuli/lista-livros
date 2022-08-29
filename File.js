const fs = require('fs/promises')

class File {

  static async read(path) {
    try {
      return await fs.readFile(path, { encoding: 'utf8' })
    } catch (err) {
      console.log(err)
    }
  }

  static async write(filename, data) {
    try {
      await fs.writeFile(filename, data)
      return true
    }
    catch (err) {
      console.warn('Erro de escrita:', err)
      return false
    }
  }
}

module.exports = File

