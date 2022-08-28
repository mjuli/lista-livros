const fs = require('fs/promises');
const axios = require('axios')
const cheerio = require('cheerio')

class BookList {

  static createBook(book) {
    let newBook = {}

    if (book && Object.keys(book).length) {
      newBook = {
        title: book.title,
        price: book.price,
        date: book.currentDate,
        bestPrice: book.price,
        bestDate: book.currentDate,
        percentage: 0.00,
        lastPrice: book.price,
        lastDate: book.currentDate,
        lastPercentage: 0.00
      }
    }

    return newBook
  }

  static removeDeletedBooks(oficialList, lastList) {
    const updatedList = { ...oficialList }

    for(let book in updatedList){
      if(!lastList[book])
        delete updatedList[book]
    }

    return updatedList
  }

  static updateBookList(oficialList, lastList) {
    const updatedList = { ...oficialList }

    for (let book in lastList) {
      if (updatedList[book]) {
        let diff = '-'

        if (!isNaN(lastList[book].price)){
          if (!isNaN(updatedList[book].price))
            diff = (100 * (updatedList[book].price - lastList[book].price) / updatedList[book].price).toFixed(2)
          else{
            updatedList[book].price = lastList[book].price
            updatedList[book].date = lastList[book].currentDate
          }
        }

        updatedList[book] = {
          ...updatedList[book],
          lastPrice     : lastList[book].price,
          lastDate      : lastList[book].currentDate,
          lastPercentage: diff
        }

        if ((Number(updatedList[book].bestPrice) > Number(lastList[book].price)) || isNaN(updatedList[book].bestPrice)) {
          updatedList[book].bestPrice = lastList[book].price
          updatedList[book].lastDate = lastList[book].currentDate
          updatedList[book].percentage = diff
        }

      } else {
        updatedList[book] = BookList
          .createBook(lastList[book])
      }
    }

    return updatedList
  }

  static async getBookList(sites) {
    const currentDate = new Date(Date.now()).toLocaleDateString()
    const booksList = {}

    for (let site of sites) {
      const response = await axios.get(site.url)
      const $ = cheerio.load(response.data)

      $('table tbody tr').each((_index, element) => {
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

    return booksList
  }

  static createBookList(lastList) {
    const oficialList = { ...lastList }

    if (lastList && Object.keys(lastList).length) {
      for (let book in lastList) {
        oficialList[book] = BookList
          .createBook(lastList[book])
      }
    }

    return oficialList
  }

  static orderByTitle(bookList) {
    let orderedTitles = Object.keys(bookList)

    return orderedTitles.sort()
  }

  static orderByPercentage(bookList, type) {
    let titlesList = Object.keys(bookList)
    let percentage = 'percentage'

    if(type === 'last')
      percentage = 'lastPercentage'

    titlesList.sort((a, b) => {
      return Number(bookList[a][percentage]) - Number(bookList[b][percentage])
    })

    return titlesList.reverse()
  }
}

module.exports = BookList

