const db = require("../../config/db");

const createVideoService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        video (video_id, user_id, content, num_like, num_comments, fileName, num_views, date_uploaded, likes, comments) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

const findByIdVideoService = async (id) => {
    const query = `
        SELECT video.*, user.username, user.avatar
        FROM video 
        JOIN user ON video.user_id = user.user_id
        WHERE video_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getVideoService = async (searchObject = {}) => {
    let {
        keyword = '',
        pageIndex = 1,
        pageSize = 2000,
        user_id = null,
        video_id = null
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
        conditions.push('video.user_id = ?');
        params.push(user_id);
    }

    // Thêm điều kiện tìm theo userId nếu có
    if (video_id) {
        conditions.push('video.video_id = ?');
        params.push(video_id);
    }

    // Kết hợp các điều kiện WHERE bằng AND nếu có ít nhất một điều kiện
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Thêm điều kiện phân trang
    const limit = parseInt(pageSize, 10);
    const offsetValue = parseInt(offset, 10);
    params.push(limit, offsetValue);

    // Câu truy vấn chính
    const query = `
    SELECT video.*, user.username, user.avatar
    FROM video
    JOIN user ON video.user_id = user.user_id
    ${whereClause}
    ORDER BY video.created_at DESC 
    LIMIT ? OFFSET ?`;


    // Câu truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM video
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

const updateByIdVideoService = async (video_id, dataUpdate) => {
    try {
        let fields = [];
        let values = [];

        // Lặp qua các key-value trong dataUpdate và xây dựng câu truy vấn động
        Object.keys(dataUpdate).forEach(field => {
            fields.push(`${field} = ?`);
            values.push(dataUpdate[field]);
        });
        values.push(video_id);

        const query = `
            UPDATE video 
            SET ${fields.join(', ')} 
            WHERE video_id = ?
            `;
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
};

//tăng view
const incrementViewService = async (video_id) => {
    try {
        // Tăng num_views lên 1
        const [result] = await db.query(`
            UPDATE video
            SET num_views = num_views + 1
            WHERE video_id = ?
        `, [video_id]);

        return result.affectedRows;
    } catch (error) {
        throw error;
    }
};

//cập nhật tổng số num_comments trong video
const updateVideoCommentCount = async (video_id) => {
    try {
        const query = `
            UPDATE video
            SET num_comments = (
                SELECT COUNT(*) 
                FROM comments
                WHERE video_id = ?
            )
            WHERE video_id = ?
        `;
        await db.query(query, [video_id, video_id]);
    } catch (error) {
        throw new Error('Error updating num_comments in video');
    }
};

//cập nhật yêu thích
const updateLikeService = async (video_id, likes, user_id) => {
    try {
        const num_like = likes?.length || 0;

        // Chuyển đổi mảng likes thành chuỗi JSON
        const likesJson = JSON.stringify(likes);

        // Cập nhật số lượng likes và danh sách likes trong cơ sở dữ liệu
        const updateVideoQuery = `
            UPDATE video
            SET 
                num_like = ?, 
                likes = ?
            WHERE video_id = ?
        `;

        // Cập nhật video trước
        await db.query(updateVideoQuery, [num_like, likesJson, video_id]);

        // Tính tổng số likes của tất cả video mà user này sở hữu
        const totalLikesQuery = `
            SELECT SUM(num_like) AS totalLikes 
            FROM video 
            WHERE user_id = ?
        `;
        const [totalLikesResult] = await db.query(totalLikesQuery, [user_id]);
        const totalLikes = totalLikesResult[0]?.totalLikes || 0;

        // Cập nhật tổng số likes cho user trong bảng user
        const updateUserQuery = `
            UPDATE user
            SET num_like = ?
            WHERE user_id = ?
        `;
        await db.query(updateUserQuery, [totalLikes, user_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

const deleteVideoService = async (id) => {
    const connection = await db.getConnection();  // Lấy connection để quản lý transaction
    try {
        await connection.beginTransaction(); // Bắt đầu transaction

        // Xóa các comment liên quan đến video
        const deleteCommentsQuery = `DELETE FROM comments WHERE video_id = ?`;
        await connection.query(deleteCommentsQuery, [id]);

        // Xóa video
        const deleteVideoQuery = `DELETE FROM video WHERE video_id = ?`;
        const [result] = await connection.query(deleteVideoQuery, [id]);

        await connection.commit(); // Commit transaction nếu mọi thứ ổn
        return result;
    } catch (error) {
        await connection.rollback(); // Rollback transaction nếu có lỗi
        throw error;
    } finally {
        connection.release(); // Giải phóng connection
    }
};

const deleteChildComments = async (connection, parentCommentId) => {
    // Truy vấn lấy các comment con từ cột 'replies' của comment cha
    const query = `SELECT replies FROM comments WHERE comment_id = ?`;
    const [rows] = await connection.query(query, [parentCommentId]);

    if (rows.length > 0 && rows[0].replies) {
        const replies = JSON.parse(rows[0].replies); // Parse replies JSON để lấy danh sách comment con
        const childCommentIds = Object.keys(replies); // Lấy danh sách các comment con

        if (childCommentIds.length > 0) {
            // Dùng hàm đệ quy để tiếp tục xóa các comment con của chúng
            for (const childId of childCommentIds) {
                await deleteChildComments(connection, childId); // Gọi đệ quy để xóa comment con
            }

            // Xóa các comment con sau khi xử lý đệ quy
            const deleteChildQuery = `DELETE FROM comments WHERE comment_id IN (${childCommentIds.map(() => '?').join(',')})`;
            await connection.query(deleteChildQuery, childCommentIds);
        }
    }
};

const deleteListVideoService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    const connection = await db.getConnection(); // Lấy connection để quản lý transaction
    try {
        await connection.beginTransaction(); // Bắt đầu transaction

        // Tạo chuỗi placeholders cho câu truy vấn SQL
        const placeholders = ids.map(() => '?').join(',');

        // Bước 1: Lấy tất cả comment cha liên quan đến video
        const selectParentCommentsQuery = `SELECT comment_id FROM comments WHERE video_id IN (${placeholders})`;
        const [parentComments] = await connection.query(selectParentCommentsQuery, ids);
        
        if (parentComments.length > 0) {
            const allCommentIds = parentComments.map(comment => comment.comment_id);
            const deleteParentCommentsQuery = `DELETE FROM comments WHERE comment_id IN (${allCommentIds.map(() => '?').join(',')})`;
            await connection.query(deleteParentCommentsQuery, allCommentIds);
        }

        // Bước 2: Lấy user_id của các video sẽ bị xóa để cập nhật lại num_like
        const selectUserQuery = `SELECT DISTINCT user_id FROM video WHERE video_id IN (${placeholders})`;
        const [userResults] = await connection.query(selectUserQuery, ids);
        const userIds = userResults.map(row => row.user_id);

        // Bước 3: Xóa video sau khi đã xóa hết comment liên quan
        const deleteVideosQuery = `DELETE FROM video WHERE video_id IN (${placeholders})`;
        const [result] = await connection.query(deleteVideosQuery, ids);

        if (result.affectedRows === 0) {
            throw new Error('Không thể xóa video, kiểm tra lại danh sách ID');
        }

        // Bước 4: Cập nhật lại số lượng likes cho từng user sau khi xóa video
        for (const userId of userIds) {
            const totalLikesQuery = `
                SELECT IFNULL(SUM(num_like), 0) AS totalLikes 
                FROM video 
                WHERE user_id = ?
            `;
            const [totalLikesResult] = await connection.query(totalLikesQuery, [userId]);
            const totalLikes = totalLikesResult[0]?.totalLikes || 0;

            const updateUserQuery = `
                UPDATE user
                SET num_like = ?
                WHERE user_id = ?
            `;
            await connection.query(updateUserQuery, [totalLikes, userId]);
        }

        await connection.commit(); // Commit transaction nếu mọi thứ ổn
        return result;
    } catch (error) {
        await connection.rollback(); // Rollback transaction nếu có lỗi
        throw error;
    } finally {
        connection.release(); // Giải phóng connection
    }
};

module.exports = {
    incrementViewService,
    updateLikeService,
    getVideoService,
    findByIdVideoService,
    updateByIdVideoService,
    createVideoService,
    deleteVideoService,
    updateVideoCommentCount,
    deleteListVideoService
}