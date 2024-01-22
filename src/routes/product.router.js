import { Router } from 'express'
import productController from '../controllers/productController.js'
import {  auth } from '../middleware/auth.js'

const router = Router()

export default router


//solo listado de productos
router.get('/', auth, async (req, res) => {

    const user = req.session.user

    const PC = new productController()
    const products = await PC.getProducts()

    return res.render('index', {
        products,
        user,
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS ESTATICO'
    })
})
