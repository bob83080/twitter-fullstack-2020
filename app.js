const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const helpers = require('./_helpers');


const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', helpers: require('./config/handlebars-helpers') })) // Handlebars 註冊樣板引擎
app.set('view engine', 'hbs') // 設定使用 Handlebars 做為樣板引擎, 使用縮寫hbs
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


require('./routes')(app)

module.exports = app

