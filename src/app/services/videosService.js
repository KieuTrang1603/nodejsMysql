const db = require("../../config/db");

const createVideoService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        video (video_id, user_id, title, description, content, num_like, num_comments, link_video, num_views, date_uploaded, likes, comments) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

const findByIdVideoService = async (id) => {
    const query = `SELECT * FROM video WHERE video_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getVideoService = async (searchObject = {}) => {
    let { 
        keyword = '',
        pageIndex = 10,
        pageSize = 1
    } = searchObject;
    const offset = (pageIndex - 1) * pageSize;

    let dataSearch = [`%${keyword}%`]

    const query = `
        SELECT * FROM video
        WHERE title LIKE  ?
        LIMIT ? OFFSET ?`;

    // Truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM video
        WHERE title LIKE ? OR email LIKE ? OR city LIKE ?`;

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

const updateByIdVideoService = async (body) => {
    try {
        const [result] = await db.query(`
            UPDATE user 
            SET 
                user_id = ?,
                title = ?, 
                description = ?, 
                content = ?, 
                num_like = ?, 
                num_comments = ?, 
                link_video = ?, 
                num_views = ?, 
                date_uploaded = ?, 
                likes = ?, 
                comments = ?
            WHERE video_id = ?
        `, body);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteVideoService = async (id) => {
    try {
        const query = `DELETE FROM video WHERE video_id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteListVideoService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi tham số cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM video WHERE id IN (${placeholders})`;

    const [result] = await db.query(query, ids);
    return result;
};

module.exports = {
    getVideoService,
    findByIdVideoService,
    updateByIdVideoService,
    createVideoService,
    deleteVideoService
}