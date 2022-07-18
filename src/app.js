const express = require('express')
const path = require('path')
const hbs = require('hbs')
const dotenv = require('dotenv')
const gather_data = require('./gather_data')
// Learn for fun
const TemperatureData = require('../models/Temperature')

const connectDB = require('../config/db')

// load config
dotenv.config({ path: './config/config.env' })

connectDB()

const app = express();
const port = process.env.PORT || 3000

// var myparam = process.argv[2];

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../views')
// const partialsPath = path.join(__dirname, '../views/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
// hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('temperature_project', {
        title: 'IoT: automated curtains'
    })
})

app.get('/getdata', (req, res) => {
    TemperatureData.find()
    .then((result) => {
        res.send({
            result
        })
    }).catch((err)=> {
        console.error(err)
    })
})

app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        errormessage: 'Page not found.'
    })
})


app.listen(port, () => {
    console.log('Server is up on port: ' + port)
});





