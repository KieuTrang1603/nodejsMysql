const db = require("../../config/db");

const createNotificationsService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO notifications (id, name, email, city) VALUES (?, ?, ?, ?)`,
        body
    );
    return result;
};


const findByIdNotificationsService = async (id) => {
    const query = `SELECT * FROM notifications WHERE id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getNotificationssService = async (searchObject = {}) => {
    let { searchTerm = '', pageIndex = 2, pageSize = 1 } = searchObject;
    const offset = (pageIndex - 1) * pageSize;

    let dataSearch = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

    const query = `
        SELECT * FROM notifications
        WHERE name LIKE ? OR email LIKE ? OR city LIKE ?
        LIMIT ? OFFSET ?`;

    // Truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM notifications
        WHERE name LIKE ? OR email LIKE ? OR city LIKE ?`;

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
        console.error(error);
        throw error;  // Để hàm gọi ở nơi khác có thể bắt lỗi
    }
};

const updateByIdNotificationsService = async (id, body) => {
    const { name, email, city } = body;
    const query = `
        UPDATE notifications
        SET name = ?, email = ?, city = ?
        WHERE id = ?`;

    const [result] = await db.query(query, [name, email, city, id]);
    return result;
};

const deleteNotificationsService = async (id) => {
    const query = `DELETE FROM notifications WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    return result;
};

const deleteListNotificationsService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi tham số cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM notifications WHERE id IN (${placeholders})`;

    const [result] = await db.query(query, ids);
    return result;
};

module.exports = {
    createNotificationsService,
    findByIdNotificationsService,
    getNotificationssService,
    updateByIdNotificationsService,
    deleteNotificationsService,
    deleteListNotificationsService,
}