const express = require('express')
const BookList = require('./BookList')
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
    const booksList = await BookList.getBookList(sites)

    await File
      .write('./public/listaAtual.json', JSON.stringify(booksList))

    res.json(booksList)
  } catch (error) {
    console.log('Erro na rota GET /:', error)
  }
})

app.get('/books', async (req, res) => {
  try {
    const lastListJSON = await BookList.getBookList(sites)

    await File
      .write('./public/listaAtual.json', JSON.stringify(lastListJSON))

    let oficialList = await File.read('./public/listaOficial.json')

    if (!oficialList)
      oficialList = BookList.createBookList(lastListJSON)

    const oficialListJSON = typeof oficialList === 'string' ?
      JSON.parse(oficialList) : oficialList

    let updatedList = BookList.updateBookLists(oficialListJSON, lastListJSON)

    await File
      .write('./public/listaOficial.json', JSON.stringify(updatedList))

    const orderBy = req.query.orderBy
    const active = req.query.active

    let orderedList = []

    if(active === 'true')
      updatedList = BookList.removeDeletedBooks(updatedList, lastListJSON)

    if (orderBy == 'title')
      orderedList = BookList.orderByTitle(updatedList)

    if (orderBy == 'percentage')
      orderedList = BookList.orderByPercentage(updatedList)


    res.render('table.ejs', { updatedList, orderedList })

  } catch (error) {
    console.log('Erro na rota GET /books:', error)
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
