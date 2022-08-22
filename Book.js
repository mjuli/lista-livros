const fs = require('fs/promises');
const ejs = require('ejs')

class Book {

  static compareBookLists(listaAntiga, listaAtual) {
    const listaAtualizada = { ...listaAntiga }

    for (let book in listaAtual) {
      if (listaAtualizada[book]) {
        listaAtualizada[book] = {
          ...listaAtualizada[book],
          lastPrice: listaAtual[book].price,
          lastDate: listaAtual[book].currentDate
        }

        // if (listaAtualizada[book].title == 'Enchantment: The Life of Audrey Hepburn') {
        //   console.log('listaAtualizada[book]: ', listaAtualizada[book])
        //   console.log('(listaAtualizada[book].bestPrice > listaAtual[book].price): ', (listaAtualizada[book].bestPrice > listaAtual[book].price))
        //   console.log('listaAtualizada[book].bestPrice == "-": ', listaAtualizada[book].bestPrice == '-')

        // }
        if ((Number(listaAtualizada[book].bestPrice) > Number(listaAtual[book].price)) || listaAtualizada[book].bestPrice == '-') {
          listaAtualizada[book].bestPrice = listaAtual[book].price
          listaAtualizada[book].lastDate = listaAtual[book].currentDate

          const diff = 100 * (listaAtualizada[book].price - listaAtual[book].price) / listaAtualizada[book].price
          listaAtualizada[book].percentage = diff.toFixed(2)
        }

      } else {
        listaAtualizada[book] = {
          title: listaAtual[book].title,
          price: listaAtual[book].price,
          date: listaAtual[book].currentDate,
          bestPrice: listaAtual[book].price,
          bestDate: listaAtual[book].currentDate,
          percentage: 0.00,
          lastPrice: listaAtual[book].price,
          lastDate: listaAtual[book].currentDate
        }
      }
    }

    return listaAtualizada
  }
}

module.exports = Book

