
import express from 'express'
import dotenv from 'dotenv'
import handlebars from 'express-handlebars'
import viewsRouter from './routes/views.router.js'
import cartRouter from './routes/cart.router.js'
import productRouter from './routes/product.router.js'
import sessionRouter from './routes/session.router.js'
import __dirname from './utils.js'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import productController from './controllers/productController.js'
import cartController from './controllers/cartController.js'
import chatController from './controllers/chatController.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'


const app = express()
dotenv.config()

const PORT = process.env.PORT
const mongoURL = process.env.MONGO_URL
const mongoDBName = process.env.MONGO_DB_NAME

app.use(session({
    store: MongoStore.create({
        mongoUrl : mongoURL,
        dbName : mongoDBName,

    }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())


app.use('/static', express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//handlebars config
app.engine('handlebars',handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')


app.use('/',viewsRouter)
app.use('/products',productRouter)
app.use('/carts',cartRouter)
app.use('/api/session',sessionRouter)

let httpServer = null

await mongoose.connect(mongoURL, {dbName: mongoDBName} ).then( () => {
   console.log('DB CONNECTION SUCCESSFUL')
    httpServer =  app.listen(PORT, () => console.log('Listening on port: '+PORT) )
}).catch((e) => {
    console.log(e)
})


const socketServer = new Server(httpServer)

socketServer.on('connection', async socket => {

    console.log('Cliente conectado')

    const PC = new productController()
    const CC = new cartController()
    const CHATC = new chatController()

    const products = await PC.getProducts()

    socket.emit('products',products)


    /* CREATE PRODUCT */
    socket.on('new-product', async product => {

        console.log('NEW PRODUCT SOCKET CALL',product)

        const result = await PC.addProduct(product)
        socket.emit('new-product-message', result)

        const refreshproducts = await PC.getProducts()
        socket.emit('products',refreshproducts)
    })

    /* DELETE PRODUCT */
    socket.on('delete-product', async id => {

        console.log('DELETE PRODUCT SOCKET CALL WITH ID',id)

        const result = await PC.deleteProduct(id)
        socket.emit('delete-product-message', result)

        const refreshproducts = await PC.getProducts()
        socket.emit('products',refreshproducts)

    })

    /* ADD PRODUCT TO CART */
    socket.on('add-product', async add_data => {

        console.log('ADD PRODUCT SOCKET CALL',add_data)

        const result = await CC.addProductToCart(add_data)

        console.log(result)
        socket.emit('add-product-message', result)

    })

    /* CHAT */
    socket.on('new-user-chat', async user => {
        console.log('user connected: ',user)

       const messages = await CHATC.getMessages()
        socket.emit('logs', messages )
    })

    socket.on('message', async data => {

       await CHATC.addMessage(data)

       const messages = await CHATC.getMessages()
       socketServer.emit('logs', messages )
    })



})
