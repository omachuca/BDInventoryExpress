const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {

    //get authorization header from api packet
    let auth = req.header('Authorization')
  console.log(auth)
    //check to be sure i got the authorization header
    if (auth !== undefined) {
  
      //split the header into "bearer" and the token
      let [, token] = auth.split(" ")
  
      //create try catch block fro token verify
  
      console.log(token)
      //verify the incoming token
      return new Promise((resolve, reject) => {
        jwt.verify(token, req.app.locals.secret, (err, payload) => {
  
          if (err !== null) {
            reject(error)
          }
          else {
            resolve(payload)
  
          }
        })
      })
        .then(payload => {
  
          return new Promise((resolve, reject) => {
  
            jwt.sign({ email: payload.email }, req.app.locals.secret, { expiresIn: '1h' }, (err, token) => {
  
              if (err !== null) {
                reject(error)
              }
              else {
                resolve(token)
  
              }
  
            })
          })
        })
        .then(freshToken => {
          //add my fresh token to req
          req.freshToken = freshToken
  
          //call the endpoint function
          next()
        })
  
  
        .catch(error => {
          console.log(error)
          res.sendStatus(403)
        })
    }
  
    else {
      res.sendStatus(403)
    }
  }
  module.exports = verifyToken
  