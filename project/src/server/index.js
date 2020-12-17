require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/latest-photos/:rover', async (req, res) => {
    try {
        let roverImages = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover}/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ roverImages })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover-info/:rover', async (req, res) => {
    try {
        let roverInfo = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ roverInfo })
    } catch (err) {
        console.log('error:', err);
    }
})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let data = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ data })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))