const express = require("express");
const router = express.Router();

const fileController = require("../app/controllers/fileController")

router.post('/video/single', fileController.uploadFileVideo.single("videoFile"), fileController.createSingleFileVideo)
router.get('/video/view',fileController.viewFileVideo)
router.post('/image/single', fileController.uploadFileImage.single("file"), fileController.createSingleImage)
router.get('/image/view',fileController.viewImage)

module.exports = router