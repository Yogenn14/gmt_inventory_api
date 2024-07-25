const productController = require('../controllers/productController')

const router = require('express').Router()


//endpoint(/api/products)
router.post('/addProduct', productController.addProduct)

router.get('/allProducts', productController.getAllProducts)
router.get('/publishedProduct', productController.getPublishedProduct)
router.get('/:id', productController.getOneProduct)
router.delete('/:id', productController.deleteProduct)
router.put('/:id', productController.updateProduct)

module.exports = router
