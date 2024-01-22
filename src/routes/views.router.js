import { Router } from 'express'
import {  auth, sessionActive } from '../middleware/auth.js'
const router = Router()

export default router


//Renders ---------------------------
router.get('/login', sessionActive,  (req,res) => {
    return res.render('login', {} )
})

router.get('/register', sessionActive,  (req,res) => {
    return res.render('register', {} )
})


//render listado de productos con websockets + alta y baja de producto
router.get('/realtimeproducts', auth, async (req,res) => {

    res.render('realTimeProducts', {
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS WEBSOCKET'
    })

})

//render
router.get('/chat', auth , (req,res) => {
    res.render('chat',{
    style: 'index.css',
    title : 'CHAT'
    })
})
