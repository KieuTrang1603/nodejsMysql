const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/usersController")

router.put('/follow', userController.follow)
router.put('/avatar/:user_id', userController.updateUserAvatar)
router.post('/login', userController.login)
router.post('/', userController.createUser)
router.get('/search', userController.getUser)
router.get('/:user_id', userController.getByIdUser)
router.put('/:user_id', userController.updateUser)
router.delete('/:user_id', userController.deleteUser)

module.exports = router