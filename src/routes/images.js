const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('../configs/multer');
const login = require('../middleware/login');
const imagesControllers = require('../controllers/images_controllers');



routes.get('/images', login.obrigatorio, imagesControllers.getImagesControllers);


routes.post('/post', login.obrigatorio, multer(multerConfig).single('file'), imagesControllers.postImagesControllers);

routes.get('/images/:id', login.obrigatorio, imagesControllers.getImageViewControllers);

routes.delete('/del/:id', login.obrigatorio, imagesControllers.deleteImagesControllers);

module.exports = routes;