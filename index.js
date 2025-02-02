const express = require('express')
const cors = require('cors');
const db = require('@cyclic.sh/dynamodb')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Get scores from user and DB, join data and write joined to DB and send to user
app.use('/:scores', async (req, res) => {
  const scoreBoardFromDB = await db.collection('scores').get('scoreBoard')
  const parsedScoreBoardFromDB = scoreBoardFromDB
    ? JSON.parse(JSON.stringify(scoreBoardFromDB, null, 2)).props.scoreBoardItems
    : []
  const scoreBoardFromUser = req.body.scoreBoardFromUser
  const minScoreFromDb = parsedScoreBoardFromDB.reduce((acc, scoreEntry) => scoreEntry.score < acc ? scoreEntry.score : acc, Infinity)
  const validScoreEntriesFromUser = scoreBoardFromUser.filter(scoreEntryFromUser => {
    const isHighscore = scoreEntryFromUser.score > minScoreFromDb
    const isUnique = !parsedScoreBoardFromDB.some(scoreEntryFromDB => scoreEntryFromDB.date === scoreEntryFromUser.date
      && scoreEntryFromDB.name === scoreEntryFromUser.name && scoreEntryFromDB.score === scoreEntryFromUser.score
    )
    return isHighscore && isUnique
  })
  let newScoreBoard
  if (validScoreEntriesFromUser.length) {
    const scoreEntriesMaxCount = 10
    newScoreBoard = parsedScoreBoardFromDB
      .concat(validScoreEntriesFromUser)
      .sort((a, b) => b.score - a.score)
      .slice(0, scoreEntriesMaxCount)
    db.collection('scores').set('scoreBoard', { scoreBoardItems: newScoreBoard })
  } else {
    newScoreBoard = parsedScoreBoardFromDB.length ? parsedScoreBoardFromDB : scoreBoardFromUser
  }
  res.json(JSON.stringify({ newScoreBoard }))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})