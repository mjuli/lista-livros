const express = require('express')
const BookList = require('./BookList')
const File = require('./File')

const PORT = process.env.PORT || 8080

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', async(req, res) => {
  try {
    const name = req.query.name
    const url = req.query.url

    let sites = await File
      .read('./public/sites.json')

    if(!sites){
      sites = '[]'

      await File
        .write('./public/sites.json', sites)
    }

    const sitesList = JSON.parse(sites)

    if(name && url){
      sitesList.push({
        name,
        url
      })

      await File
        .write('./public/sites.json', JSON.stringify(sitesList))
    }

    res.render('index.ejs', { sitesList })
  } catch (error) {
    console.error('Erro na rota GET /:', error)
  }
})

app.get('/books', async (req, res) => {
  try {
    const sites = await File
      .read('./public/sites.json')

    const booksList = await BookList
      .getBookList(JSON.parse(sites))

    await File
      .write('./public/listaAtual.json', JSON.stringify(booksList))

    res.json(booksList)
  } catch (error) {
    console.error('Erro na rota GET /books:', error)
  }
})

app.get('/books/price', async (req, res) => {
  try {
    const sites = await File
      .read('./public/sites.json')

    const lastListJSON = await BookList
      .getBookList(JSON.parse(sites))

    await File
      .write('./public/listaAtual.json', JSON.stringify(lastListJSON))

    let oficialList = await File
      .read('./public/listaOficial.json')

    if (!oficialList)
      oficialList = BookList
        .createBookList(lastListJSON)

    const oficialListJSON = typeof oficialList === 'string' ?
      JSON.parse(oficialList) : oficialList

    let updatedList = BookList
      .updateBookLists(oficialListJSON, lastListJSON)

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
    console.error('Erro na rota GET /books/price:', error)
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
