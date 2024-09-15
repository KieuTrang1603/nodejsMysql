const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/usersController")

router.put('/follow', userController.follow)
router.post('/login', userController.login)
router.post('/', userController.createUser)
router.get('/:user_id', userController.getByIdUser)
router.put('/:user_id', userController.updateUser)
router.delete('/:user_id', userController.deleteUser)
router.get('/', userController.getUser)

module.exports = router