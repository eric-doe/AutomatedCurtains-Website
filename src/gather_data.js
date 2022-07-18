
const request = require('request')


const gather_data = (callback) => {
    const url = '/getdata'
    request({ url, json: true }, (error, { body } = {}) => {
        if (error) {
            callback('Unable to connect to database.', undefined)
        } else if (Object.keys(body).length === 0) {
            callback('JSON data empty')
        } else if (Object.keys(body).length > 0) {
            callback(undefined, { })
        }
    })
}


module.exports = gather_data
