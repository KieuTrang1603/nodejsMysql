const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/usersController")


router.put('/follow', userController.follow)
router.post('/login', userController.login)
router.post('/', userController.createUser)
router.get('/:id', userController.getByIdUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)
router.get('/', userController.getUser)

module.exports = router