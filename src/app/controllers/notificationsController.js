const { getNotificationsService, createNotificationService, findByIdNotificationService, updateNotificationSeenService, deleteNotificationService } = require("../services/notificationsService");
const { v4: uuidv4 } = require('uuid');

//Lấy danh sách
const getNotification = async (req, res, next) => {
    try {
        let data = await getNotificationsService(req.query);
        return res.json({
            code: 200,
            message: "Thành công",
            data: data,
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

//Lấy ra 1 bản ghi theo id
const getByIdNotification = async (req, res, next) => {
    const { notification_id } = req.params;
    
    try {
        let item = await findByIdNotificationService(notification_id);
        res.json({
            code: 200,
            message: 'Notification successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

//Tạo mới
const createNotification = async (req, res, next) => {
    const notification_id = uuidv4();
    const {
        user_id,
        video_id,
        comment_id,
        type_notification,
        content,
        seen = false,
        redirect_to,
        is_read = false,
    } = req.body;

    let dataInsert = [
        notification_id,
        user_id,
        video_id,
        comment_id,
        type_notification,
        content,
        seen,
        redirect_to || null,
        is_read,
    ]

    try {
        await createNotificationService(dataInsert)
        let item = await findByIdNotificationService(notification_id);
        res.json({
            code: 200,
            message: 'Notification created successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

// Cập nhật trạng thái xem
const updateNotificationSeen = async (req, res, next) => {
    const { notification_id } = req.params;

    try {
        // Gọi service để cập nhật trạng thái seen thành true
        const result = await updateNotificationSeenService(notification_id);

        // Kiểm tra nếu không có bản ghi nào được cập nhật
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Notification not found',
            });
        }

        // Trả về thông báo cập nhật thành công
        const updatedNotification = await findByIdNotificationService(notification_id);
        res.json({
            code: 200,
            message: 'Notification seen status updated successfully',
            data: updatedNotification
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating notification seen status',
            error: error.message
        });
    }
}

// Xóa
const deleteNotification = async (req, res, next) => {
    const { notification_id } = req.params;

    try {
        const result = await deleteNotificationService(notification_id);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Notification not found',
            });
        }

        res.json({
            code: 200,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting notification',
            error: error.message
        });
    }
}

module.exports = {
    getNotification,
    createNotification,
    updateNotificationSeen,
    getByIdNotification,
    deleteNotification,
}