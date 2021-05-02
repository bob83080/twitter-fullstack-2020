const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const socket = require('socket.io')
const Message = db.Message
const User = db.User
const helpers = require('./_helpers');
const moment = require('moment')

const app = express()
const port = process.env.PORT || 3000
// require('./config/mongoose')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const passport = require('./config/passport')

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', helpers: require('./config/handlebars-helpers') })) // Handlebars 註冊樣板引擎
app.set('view engine', 'hbs') // 設定使用 Handlebars 做為樣板引擎, 使用縮寫hbs
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())


app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

let loginID, loginName, loginAvatar, loginAccount

app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    res.locals.user = helpers.getUser(req)
    if (helpers.getUser(req)) {
        loginID = helpers.getUser(req).id
        loginName = helpers.getUser(req).name
        loginAvatar = helpers.getUser(req).avatar
        loginAccount = helpers.getUser(req).account
    }
    next()
})

let onlineUsers = []

const sever = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(sever)


io.on('connection', async socket => {
    console.log('a user connected!');
    onlineUsers.push({ loginID, loginName, loginAvatar, loginAccount })
    const loginUser = onlineUsers.find(user => user.loginID === loginID)

    let historyMessages
    await Message.findAll({
        include: [User],
        order: [['createdAt', 'ASC']]
    }).then(messages => {
        historyMessages = messages.map(item => ({
            text: item.dataValues.text,
            name: item.dataValues.User.name,
            avatar: item.dataValues.User.avatar,
            isLoginUser: loginUser.loginID === item.dataValues.User.id ? true : false,
            time: moment(item.dataValues.createdAt).format('LLL')
        }))
    })

    let users
    await User.findAll().then(results => {

        users = results.map(item => ({
            ...item.dataValues,
            account: item.dataValues.account,
            name: item.dataValues.name,
            avatar: item.dataValues.avatar,
        }))
    })

    socket.emit('history', historyMessages)
    socket.broadcast.emit('message', `${loginUser.loginName} 上線`)

    io.emit('onlineUsers', onlineUsers)

    socket.on("message", data => {
        console.log('send message')
        io.emit("message", 'data')
    })

    socket.on("connected", users => {
        console.log('send user')
        console.log('users:', users)
        io.emit("connected", users)
    })

    socket.on('disconnect', function () {
        console.log('a user go out')
        socket.broadcast.emit('message', `${loginUser.loginName} 離線`)

        onlineUsers = onlineUsers.filter(users => users.loginID !== loginUser.loginID)
        socket.broadcast.emit('onlineUsers', onlineUsers)
    })


    socket.on('chat', async msg => {
        await Message.create({
            UserId: loginUser.loginID,
            text: msg
        }).then((messages => {
            receiverMessage = {
                text: messages.dataValues.text,
                name: loginUser.loginName,
                avatar: loginUser.loginAvatar,
                time: moment(messages.dataValues.createdAt).format('LLL')
            }
        }))
        socket.broadcast.emit('chat', receiverMessage)
    })
})


require('./routes')(app)

module.exports = app

