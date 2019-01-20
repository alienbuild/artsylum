## Artsylum 
Social network for developing artists built using MERN stack technology.

App expects a keys.js file located in `./config/keys.js`. This should hold and export your MongoDB credentials ie:

`module.exports = {
    mongoURI: 'mongodb://username:password@ds235732.mlab.com:35732/artsylum',
    secret: '******'
};`

Install with

`npm i`

Run the server with

`npm run server`