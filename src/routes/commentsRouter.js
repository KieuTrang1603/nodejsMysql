const express = require("express");
const router = express.Router();

const commentsController = require("../app/controllers/commentsController")

router.post('/', commentsController.createComment)
router.get('/:comment_id', commentsController.getByIdComment)
router.put('/:comment_id', commentsController.updateComment)
router.delete('/:comment_id', commentsController.deleteComment)
router.get('/', commentsController.getComment)

module.exports = router