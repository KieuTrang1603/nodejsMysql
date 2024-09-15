const express = require("express");
const router = express.Router();

const videosController = require("../app/controllers/videosController")

router.post('/', videosController.createVideo)
router.get('/:video_id', videosController.getByIdVideo)
router.put('/:video_id', videosController.updateVideo)
router.delete('/:video_id', videosController.deleteVideo)
router.get('/', videosController.getVideo)

module.exports = router