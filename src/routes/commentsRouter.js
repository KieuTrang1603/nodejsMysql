const express = require("express");
const router = express.Router();

const commentsController = require("../app/controllers/commentsController")

router.post('/', commentsController.createComment)

router.put('/:comment_id/update-like', commentsController.updateLike);

router.get('/search', commentsController.getComment)
router.get('/:comment_id', commentsController.getByIdComment)
router.put('/:comment_id', commentsController.updateComment)
router.delete('/ids', commentsController.deleteComments)
router.delete('/:comment_id', commentsController.deleteComment)

module.exports = router