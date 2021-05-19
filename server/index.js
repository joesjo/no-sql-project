const express = require('express')
const app = express()
const port = 3000
const db = require('./modules/db')

app.get('/', (req, res) => {
    res.send('NUTRICIPIES')
})

app.get('/recipes', (req, res) => {
    db.listRecipes()
     .then(result => res.send(result))
    .catch(err => res.send(err))
})

app.get('/recipes/:id', (req, res) => {
    db.getRecipe(req.params.id)
    .then(result => res.send(result))
    .catch(err => res.send(err))
})

app.get('/ingredients/:id', (req, res) => {
    db.getIngredientPrices(req.params.id)
    .then(result => res.send(result))
    .catch(err => res.send(err))
})

app.get('/users', (req, res) => {
    db.getUsers()
    .then(result => res.send(result))
    .catch(err => res.send(err))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})