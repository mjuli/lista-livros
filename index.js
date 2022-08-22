const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const Book = require('./Book')
const File = require('./File')

const PORT = process.env.PORT || 8080

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

const sites = [
  {
    nome: 'Amazon - Livros que faltam comprar',
    url: 'https://www.amazon.com.br/hz/wishlist/printview/C871CEY6KYTP'
  },
  {
    nome: 'Amazon - Top 15',
    url: 'https://www.amazon.com.br/hz/wishlist/printview/1M1MKAYJV4OBT'
  }
]

app.get('/', async (req, res) => {
  try {
    const currentDate = new Date(Date.now()).toLocaleDateString()
    const booksList = {}

    for (let site of sites) {
      const response = await axios.get(site.url)
      const $ = cheerio.load(response.data)

      $('table tbody tr').each((index, element) => {
        const title = $($(element).find("td span")[0]).text()
        let price = $($(element).find("td")[3]).text()
        const shortTitle = title.slice(0, 30)

        if (title && !booksList[shortTitle]) {

          price = price
            .replace('R$ ', '')
            .replace(',', '.')

          booksList[shortTitle] = {
            title,
            price,
            currentDate
          }
        }
      })
    }

    await File
      .write('./public/listaAtual.json', JSON.stringify(booksList))

    res.json(booksList)

  } catch (error) {
    console.log('Erro na rota GET /:', error)
  }
})

app.get('/books', async (req, res) => {
  try {
    const oficialList = await File.read('./public/listaOficial.json')
    const oficialListJSON = JSON.parse(oficialList)

    const lastList = await File.read('./public/listaAtual.json')
    const lastListJSON = JSON.parse(lastList)

    const updatedList = Book.compareBookLists(oficialListJSON, lastListJSON)

    await File
      .write('./public/listaOficial.json', JSON.stringify(updatedList))

    res.render('table.ejs', { updatedList })
  } catch (error) {
    console.log('Erro na rota GET /books:', error)
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
