const routes = require('express').Router();
const userController = require('../controllers/users_controllers');


routes.post('/cadastro', userController.postCadastroUsers);

routes.post('/login', userController.postLoginUsers);

module.exports = routes;