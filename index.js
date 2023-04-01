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

// Get scores from user and DB, join data and write joined to DB and send to user
app.use('/:scores', async (req, res) => {
  const scores = req.params.scores
  const scoreBoardFromDB = await db.collection(scores).get('scoreBoard')
  const parsedScoreBoardFromDB = scoreBoardFromDB
    ? JSON.parse(JSON.stringify(scoreBoardFromDB, null, 2)).props.scoreBoardItems
    : []
  const scoreBoardFromUser = req.body.scoreBoardFromUser
  const minScoreFromDb = parsedScoreBoardFromDB.reduce((acc, scoreEntry) => acc < scoreEntry.score ? acc : scoreEntry.score, Infinity)
  const maxScoreFromUser = scoreBoardFromUser.reduce((acc, scoreEntry) => acc > scoreEntry.score ? acc : scoreEntry.score, 0)
  let newScoreBoard
  if (minScoreFromDb < maxScoreFromUser) {
    newScoreBoard = parsedScoreBoardFromDB
      .concat(scoreBoardFromUser)
      .reduce((acc, scoreEntry) => {
        const entryFound = acc.find(({ date, name, score }) => scoreEntry.date === date && scoreEntry.name === name && scoreEntry.score === score)
        if (entryFound) {
          return acc
        }
        return [...acc, scoreEntry]
      }, [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
    db.collection(scores).set('scoreBoard', { scoreBoardItems: newScoreBoard })
  } else {
    newScoreBoard = scoreBoardFromUser
  }
  res.json(JSON.stringify({ newScoreBoard }))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})