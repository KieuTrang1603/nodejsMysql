const db = require("../../config/db");

const createNotificationService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        user (notification_id, user_id, video_id, comment_id, type_notification, content, seen, redirect_to, is_read) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};


const findByIdNotificationService = async (id) => {
    const query = `SELECT * FROM notifications WHERE notification_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getNotificationsService = async (searchObject = {}) => {
    let { keyword = '', pageIndex = 10, pageSize = 1 } = searchObject;
    const offset = (pageIndex - 1) * pageSize;

    const query = `
        SELECT * FROM notifications
        LIMIT ? OFFSET ?`;

    // Truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM notifications`;

    try {
        // Thực hiện cả hai truy vấn đồng thời
        const [results, countResults] = await Promise.all([
            db.query(query, [...dataSearch, pageSize, offset]),
            db.query(countQuery, dataSearch)
        ]);

        // Lấy tổng số bản ghi từ truy vấn đếm
        const total = countResults[0][0].total;

        return {
            content: results?.[0] || [],
            total: total,
            pageSize: results?.[0]?.length || 0,
            pageIndex: pageIndex
        };
    } catch (error) {
        throw error; 
    }
};


//Cập nhật trạng thái của phiếu là đã xem
const updateNotificationSeenService = async (id) => {
    const query = `
        UPDATE notifications
        SET seen = true
        WHERE notification_id = ?
    `;
    try {
        const [result] = await db.query(query, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};


const deleteNotificationService = async (id) => {
    try {
        const query = `DELETE FROM notifications WHERE notification_id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteListNotificationService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi tham số cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM notifications WHERE notification_id IN (${placeholders})`;

    const [result] = await db.query(query, ids);
    return result;
};

module.exports = {
    createNotificationService,
    findByIdNotificationService,
    getNotificationsService,
    deleteNotificationService,
    deleteListNotificationService,
    updateNotificationSeenService
}