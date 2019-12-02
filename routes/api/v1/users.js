const express = require('express');
const router = express.Router();
const fs = require('fs')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')


const googleAuth = new OAuth2Client("340443039362-4nbmlkv2ljr14oohnj9t45dqemkbq32s.apps.googleusercontent.com")

//get all users

router.get('/', function (req, res, next) {

    try {
        req.app.locals.collectionUsers.find({}).toArray(function (err, result) {
            if (err) {
                throw err;
            }
            res.json(result)
        })
    }
    catch (error) {
        console.log('Error', error)
    }

})

//add a user
router.post('/', function (req, res, next) {

    try {
        const image = req.files.image
        image.mv(`${__dirname}/../public/images/${image.name}`)
        req.body.imageName = image.name
        req.app.locals.collectionUsers.insertOne(req.body)
        res.send("OK")
    }
    catch (error) {
        res.status(400).json({ msg: "Item Not Added" })
    }

})
router.post('/login', function (req, res, next) {
    // get matching document
    req.app.locals.collectionUsers.findOne({ email: req.body.email })
        .then(foundDoc => {
            if (foundDoc === null) {
                throw new Error("Not Authorized")
            }

            return bcrypt.compare(req.body.password, foundDoc.passwordDash)
        })
        .then(validPassword => {
            if (validPassword !== true) {
                throw new Error("Invalid Password")
            }

            return new Promise((resolve, Reject) => {
                jwt.sign({ email: req.body.passwordDash }, req.app.locals.secret, (err, token) => {
                    if (err !== null) {
                        Reject(error)
                    }
                    else {
                        resolve(token)
                    }

                })
            })

        })
        .then(token => {
            console.log(token)
            res.json(token)

        })
        .catch(error => {
            res.status(403).statusMessage(error.msg) //forbiden error
        })

})
router.post('/oauth/google', function (req, res, next) {
    console.log(req.body)
    //verify google token
    googleAuth.verifyIdTokenAsync({
        idToken: req.body.tokenId,
        audience: "340443039362-4nbmlkv2ljr14oohnj9t45dqemkbq32s.apps.googleusercontent.com"

    })

        .then(ticket => {
            console.log("tickets")
            return ticket.getPayload()

        })
        
        .then(payload => {

            return req.app.locals.collectionUsers.findOne({ email: payload.email })
        })

        .then(foundDoc => {
            console.log('found doc')
            if (foundDoc === null) {
                throw new Error("Not Authorized")
            }

            return new Promise((resolve, reject) => {
                jwt.sign({ email: foundDoc.email }, req.app.locals.secret, (err, token) => {
                    if (err !== null) {
                        reject(error)
                    }
                    else {
                        resolve(token)
                    }

                })
            })

        })
        .then(token => {
            console.log(token)
            res.json(token)

        })
        .catch(error => {
            console.log("error")
            res.status(403)//.statusMessage(error.msg) //forbiden error
        })

})

// delete user
router.delete('/:id', function (req, res, next) {

    req.app.locals.collectionUsers.findOne({ _id: ObjectId(req.params.id) }, { imageName: 1 })
        .then(document => {
            if (document !== null) {
                fs.unlinkSync(`${__dirname}/../../../public/images/${document.imageName}`)
            }

            return req.app.locals.collectionUsers.deleteOne({ _id: ObjectId(req.params.id) })
        })
        .then(delResult => {
            res.send("Ok")
        })
        .catch(error => {
            res.status(400).json({ msg: "Item Not Deleted" })
        })

})

//up date user
router.put(`/:id`, function (req, res, next) {

    try {
        req.app.locals.collectionUsers.replaceOne({ _id: ObjectId(req.params.id) }, req.body)
        res.send("Ok")
    }
    catch (error) {
        console.log('Error', error)
    }
})


module.exports = router;
