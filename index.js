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
  const minScoreFromDb = c.reduce((acc, scoreEntry) => scoreEntry.score < acc ? scoreEntry.score : acc, Infinity)
  const validScoreEntriesFromUser = scoreBoardFromUser.filter(scoreEntryFromUser => {
    const isHighscore = scoreEntryFromUser.score > minScoreFromDb
    const isUnique = !parsedScoreBoardFromDB.some(scoreEntryFromDB => scoreEntryFromDB.date === scoreEntryFromUser.date
      && scoreEntryFromDB.name === scoreEntryFromUser.name && scoreEntryFromDB.score === scoreEntryFromUser.score
    )
    return isHighscore && isUnique
  }
  )
  let newScoreBoard
  if (validScoreEntriesFromUser.length) {
    newScoreBoard = parsedScoreBoardFromDB
      .concat(validScoreEntriesFromUser)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    db.collection(scores).set('scoreBoard', { scoreBoardItems: newScoreBoard })
    console.log('newScoreBoard writen:', newScoreBoard)
  } else {
    newScoreBoard = scoreBoardFromUser
    console.log('newScoreBoard not writen:', newScoreBoard)
  }
  res.json(JSON.stringify({ newScoreBoard }))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})