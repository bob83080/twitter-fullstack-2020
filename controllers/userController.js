const fs = require('fs')
const helpers = require('../_helpers')
const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

let userController = {
  loginPage: (req, res) => {
    return res.render('login')
  },
  registerPage: (req, res) => {
    return res.render('register')
  },
  userRegister: (req, res) => {
    User.create({
      account: req.body.account,
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
    }).then(user => {
      return res.redirect('/login')
    })
  },

  settingPage: (req, res) => {
    return res.render('setting')
  },
  getUser: async (req, res) => {

    const result = await Tweet.findAndCountAll({
      raw: true,
      nest: true,
      where: {
        userId: req.params.id
      },
      distinct: true,
    })
    const tweets = result.rows
    return User.findByPk(req.params.id)
      .then(user => {
        console.log(user)
        res.render('profile', {
          user: user, tweets
        })
      })
  },


}

module.exports = userController