const express = require("express");
const router = express.Router();

const notificationsController = require("../app/controllers/notificationsController")


router.post('/', notificationsController.createNotification)
router.put('/:notification_id/seen', notificationsController.updateNotificationSeen)
router.delete('/:notification_id', notificationsController.deleteNotification)
router.get('/:notification_id', notificationsController.getByIdNotification)
router.get('/', notificationsController.getNotification)

module.exports = router