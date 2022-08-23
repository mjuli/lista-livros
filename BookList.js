const fs = require('fs/promises');
const axios = require('axios')
const cheerio = require('cheerio')

class BookList {

  static removeDeletedBooks(oficialList, lastList) {
    const updatedList = { ...oficialList }

    for(let book in updatedList){
      if(!lastList[book])
        delete updatedList[book]
    }

    return updatedList
  }

  static updateBookLists(oficialList, lastList) {
    const updatedList = { ...oficialList }

    for (let book in lastList) {
      if (updatedList[book]) {
        updatedList[book] = {
          ...updatedList[book],
          lastPrice: lastList[book].price,
          lastDate: lastList[book].currentDate
        }

        if ((Number(updatedList[book].bestPrice) > Number(lastList[book].price)) || updatedList[book].bestPrice == '-') {
          updatedList[book].bestPrice = lastList[book].price
          updatedList[book].lastDate = lastList[book].currentDate

          const diff = 100 * (updatedList[book].price - lastList[book].price) / updatedList[book].price
          updatedList[book].percentage = diff.toFixed(2)
        }

      } else {
        updatedList[book] = {
          title: lastList[book].title,
          price: lastList[book].price,
          date: lastList[book].currentDate,
          bestPrice: lastList[book].price,
          bestDate: lastList[book].currentDate,
          percentage: 0.00,
          lastPrice: lastList[book].price,
          lastDate: lastList[book].currentDate
        }
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

    return booksList
  }

  static createBookList(lastList) {
    const oficialList = { ...lastList }

    if (lastList && Object.keys(lastList).length) {
      for (let book in lastList) {
        oficialList[book] = {
          title: lastList[book].title,
          price: lastList[book].price,
          date: lastList[book].currentDate,
          bestPrice: lastList[book].price,
          bestDate: lastList[book].currentDate,
          percentage: 0.00,
          lastPrice: lastList[book].price,
          lastDate: lastList[book].currentDate
        }
      }
    }

    return oficialList
  }

  static orderByTitle(bookList) {
    let orderedTitles = Object.keys(bookList)

    return orderedTitles.sort()
  }

  static orderByPercentage(bookList) {
    let titlesList = Object.keys(bookList)

    titlesList.sort((a, b) => {
      return Number(bookList[a].percentage) - Number(bookList[b].percentage)
    })

    return titlesList.reverse()
  }
}

module.exports = BookList

