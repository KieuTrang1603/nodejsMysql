const db = require("../../config/db");

const createCommentService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        user (comment_id, user_id, video_id, content, num_likes, num_replies, likes, replies) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

const findByIdCommentService = async (id) => {
    const query = `SELECT * FROM comments WHERE comment_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getCommentsService = async (searchObject = {}) => {
    let { keyword = '', pageIndex = 10, pageSize = 1 } = searchObject;
    const offset = (pageIndex - 1) * pageSize;


    const query = `
        SELECT * FROM comments
        LIMIT ? OFFSET ?`;

    // Truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM comments`;

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
        throw error;  // Để hàm gọi ở nơi khác có thể bắt lỗi
    }
};

const updateCommentService = async (id, body) => {
    try {
        const query = `
        UPDATE comments 
        SET 
            content = ?, 
            num_likes = ?, 
            num_replies = ?, 
            likes = ?, 
            replies = ?
        WHERE comment_id = ?
    `;
        const [result] = await db.query(query, body);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteCommentService = async (id) => {
    try {
        const query = `DELETE FROM comments WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteListCommentService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi tham số cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM comments WHERE id IN (${placeholders})`;

    const [result] = await db.query(query, ids);
    return result;
};

module.exports = {
    getCommentsService,
    findByIdCommentService,
    updateCommentService,
    createCommentService,
    deleteCommentService,
    deleteListCommentService
}