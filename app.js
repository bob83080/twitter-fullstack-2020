const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const socket = require('socket.io')

const helpers = require('./_helpers');


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
let currentUserID,currentUserName,currentUserAvatar,currentUserAccount  
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    res.locals.user = helpers.getUser(req)
    if (helpers.getUser(req)) {
    currentUserID = helpers.getUser(req).id
    currentUserName = helpers.getUser(req).name
    currentUserAvatar = helpers.getUser(req).avatar
    currentUserAccount = helpers.getUser(req).account
}
    next()
})

let activeUsers = []
const sever = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(sever)



io.on('connection', (socket) => {
    console.log('hi socket', socket.id)
    console.log('a user connected')

    //上線名單蒐集
    activeUsers.push({currentUserID, currentUserName, currentUserAvatar, currentUserAccount})
    //目前的使用者
    const currentUser = activeUsers.find(user => user.currentUserID ===  currentUserID)
    //發送到active-users客戶端上線的名單
    io.emit('active-users', activeUsers)

    socket.broadcast.emit('chat message info', `${currentUser.currentUserName} 上線`)

    socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
})
    socket.on('disconnect', () => {
        console.log('user disconnected')
        
        activeUsers=  activeUsers.filter(user => user.currentUserID!== currentUser.currentUserID)
        socket.broadcast.emit('chat message info', `${currentUser.currentUserName} 離開聊天`)
    
    })
})
require('./routes')(app)

module.exports = app

