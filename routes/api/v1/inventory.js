const express = require('express');
const router = express.Router();
const fs = require('fs')
const ObjectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken')
const verifyToken = require('../VerifyToken')


//get all inevtory items
router.get('/', function (req, res, next) {

  try {

    req.app.locals.collectionProducts.find({}).toArray(function (err, result) {
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

//add a inventory item
router.post('/', verifyToken, function (req, res, next) {
  console.log("no")
  try {
    const image = req.files.image
    image.mv(`${__dirname}/../../../public/images/${image.name}`)
    req.body.imageName = image.name
    req.app.locals.collectionProducts.insertOne(req.body)
    res.json(req.freshToken)
  }
  catch (error) {
    res.status(400).json({ msg: "Item Not Added" })
  }

})

// delete inventory item
router.delete('/:id', function (req, res, next) {

  req.app.locals.collectionProducts.findOne({ _id: ObjectId(req.params.id) }, { imageName: 1 })
    .then(document => {
      if (document !== null) {
        if (fs.existsSync(`${__dirname}/../../../public/images/${document.imageName}`)) {


          fs.unlinkSync(`${__dirname}/../../../public/images/${document.imageName}`)
        }
      }

      return req.app.locals.collectionProducts.deleteOne({ _id: ObjectId(req.params.id) })
    })
    .then(delResult => {
      res.send("Ok")
    })
    .catch(error => {
      res.status(400).json({ msg: "Item Not Deleted" })
    })

})

//up date inventory
router.put(`/:id`, function (req, res, next) {

  try {
    req.app.locals.collectionProducts.replaceOne({ _id: ObjectId(req.params.id) }, req.body)
    res.send("Ok")
  }
  catch (error) {
    console.log('Error', error)
  }
})


module.exports = router;
