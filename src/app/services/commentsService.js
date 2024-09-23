const db = require("../../config/db");

const createCommentService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        comments (comment_id, user_id, video_id, content, num_likes, num_replies, likes, replies, parent_comment_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

const findByIdCommentService = async (id) => {
    const query = `SELECT comments.*, user.username, user.avatar, video.content as video_content 
                    FROM comments
                    JOIN video ON comments.video_id = video.video_id
                    JOIN user ON comments.user_id = user.user_id
                    WHERE comment_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getCommentsService = async (searchObject = {}) => {
    let {
        keyword = '',
        pageIndex = 1,
        pageSize = 2000,
        user_id = null,
        video_id = null,
        comment_id = null
    } = searchObject;

    const offset = (pageIndex - 1) * pageSize;
    const conditions = [];
    const params = [];

    // Thêm điều kiện tìm kiếm keyword nếu có
    if (keyword) {
        conditions.push('content LIKE ?');
        params.push(`%${keyword}%`);
    }

    // Thêm điều kiện tìm theo userId nếu có
    if (user_id) {
        conditions.push('comments.user_id = ?');
        params.push(user_id);
    }

    if (video_id) {
        conditions.push('comments.video_id = ?');
        params.push(video_id);
    }

    if (comment_id) {
        conditions.push('comment_id = ?');
        params.push(comment_id);
    }

    // Kết hợp các điều kiện WHERE bằng AND nếu có ít nhất một điều kiện
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Thêm điều kiện phân trang
    const limit = parseInt(pageSize, 10);
    const offsetValue = parseInt(offset, 10);
    params.push(limit, offsetValue);

    // Câu truy vấn chính
    const query = `
        SELECT comments.*, user.username, user.avatar, video.content as video_content
        FROM comments
        JOIN video ON comments.video_id = video.video_id
        JOIN user ON comments.user_id = user.user_id
        ${whereClause}
        LIMIT ? OFFSET ?`;

    // Câu truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM comments
        ${whereClause}`;

    try {
        // Thực hiện truy vấn
        const [results, countResults] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, params.slice(0, params.length - 2))  // Bỏ phân trang cho truy vấn đếm
        ]);

        const total = countResults[0][0].total;
        const totalPage = Math.ceil(total / pageSize)

        return {
            content: results?.[0] || [],
            total,
            totalPage,
            numberOfElements: results?.[0]?.length || 0,
            pageIndex
        };
    } catch (error) {
        console.error(error);
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

const updateLikeService = async (comment_id, likes) => {
    try {
        const num_like = likes?.length || 0;

        // Chuyển đổi mảng likes thành chuỗi JSON
        const likesJson = JSON.stringify(likes);

        // Cập nhật số lượng likes và danh sách likes trong cơ sở dữ liệu
        const updateVideoQuery = `
            UPDATE comments
            SET 
                num_likes = ?, 
                likes = ?
            WHERE comment_id = ?
        `;

        await db.query(updateVideoQuery, [num_like, likesJson, comment_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

const updateCommentRepliesService = async (parent_comment_id, updatedReplies) => {
    const num_replies = updatedReplies?.length || 0;
    const sql = `UPDATE comments SET replies = ?, num_replies = ? WHERE comment_id = ?`;
    const [result] = await db.execute(sql, [JSON.stringify(updatedReplies), num_replies, parent_comment_id]);
    return result;
};

const deleteCommentService = async (id) => {
    try {
        // Kiểm tra nếu comment có replies
        const checkRepliesQuery = `SELECT replies FROM comments WHERE comment_id = ?`;
        const [rows] = await db.query(checkRepliesQuery, [id]);

        if (rows.length > 0 && rows[0].replies) {
            // Nếu replies không rỗng, báo lỗi
            const replies = JSON.parse(rows[0].replies);
            if (Object.keys(replies).length > 0) {
                throw new Error('Cannot delete comment because it has replies');
            }
        }

        // Nếu không có replies, tiến hành xóa comment
        const deleteQuery = `DELETE FROM comments WHERE comment_id = ?`;
        const [result] = await db.query(deleteQuery, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteListCommentService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi placeholders cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');

    // Kiểm tra nếu comment có replies
    const checkRepliesQuery = `SELECT comment_id, replies FROM comments WHERE comment_id IN (${placeholders})`;
    const [rows] = await db.query(checkRepliesQuery, ids);

    // Kiểm tra xem comment nào có replies
    for (const row of rows) {
        if (row.replies) {
            const replies = JSON.parse(row.replies);
            if (Object.keys(replies).length > 0) {
                throw new Error(`Cannot delete comment with id ${row.comment_id} because it has replies`);
            }
        }
    }

    // Nếu không có replies, tiến hành xóa
    const deleteQuery = `DELETE FROM comments WHERE comment_id IN (${placeholders})`;
    const [result] = await db.query(deleteQuery, ids);
    return result;
};

module.exports = {
    getCommentsService,
    findByIdCommentService,
    updateCommentService,
    createCommentService,
    deleteCommentService,
    deleteListCommentService,
    updateCommentRepliesService,
    updateLikeService
}