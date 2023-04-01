const express = require('express')
const cors = require('cors');
const db = require('@cyclic.sh/dynamodb')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
app.post('/:col/:key', async (req, res) => {
  console.log(req.body)

  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Delete an item
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a single item
app.get('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a full listing
app.get('/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
})

// Catch all handler for all other request.
app.use('/:scores', async (req, res) => {
  const scores = req.params.scores
  // const { results: scoreBoardFromDB } = await db.collection(scores).list()
  const {scoreBoardFromDB} = await db.collection(scores).get('scoreBoard')
  console.log('scoreBoardFromDB:', scoreBoardFromDB.props)
  const scoreBoardFromUser = req.body.scoreBoardFromUser
  console.log('scoreBoardFromUser:', scoreBoardFromUser)
  // const newScoreBoard = scoreBoardFromDB
  //   .concat(scoreBoardFromUser)
  //   .reduce((acc, scoreEntry) => {
  //     const entryFound = acc.find(({ date, name, score }) => scoreEntry.date === date && scoreEntry.name === name && scoreEntry.score === score)
  //     if (entryFound) {
  //       return acc
  //     }
  //     return [...acc, scoreEntry]
  //   }, [])
  // console.log('newScoreBoardCalculated:', newScoreBoard)
  // const newScoreBoardFromDB = await db.collection(scores).set('scoreBoard', newScoreBoard)
  // console.log('newScoreBoardFromDB:', newScoreBoardFromDB)
  // res.json(JSON.stringify({ newScoreBoard }))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})