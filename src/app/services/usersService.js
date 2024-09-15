const db = require("../../config/db");

//login
const loginService = async (data) => {
    const query = `SELECT * FROM user WHERE (email = ? OR username = ?) AND password = ? LIMIT 1`;
    const [results] = await db.query(query, data);
    return results[0] || null;
};

//tạo tài khoản
const createUserService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        user (user_id, username, password, fullName, phoneNumber, email, num_following, num_followers, num_like, avatar, role, followings, followers ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

//lấy ra dữ liệu 1 bản ghi
const findByIdUserService = async (id) => {
    const query = `SELECT * FROM user WHERE user_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

//lấy ra danh sách
const getUsersService = async (searchObject = {}) => {
    let { keyword = '', pageIndex = 1, pageSize = 10 } = searchObject;
    const offset = (pageIndex - 1) * pageSize;

    let dataSearch = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]

    const query = `
        SELECT * FROM user
        WHERE username LIKE ? OR email LIKE ? OR phoneNumber LIKE ?
        LIMIT ? OFFSET ?`;

    // Truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM user
        WHERE username LIKE ? OR email LIKE ? OR phoneNumber LIKE ?`;

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

//cập nhật thông tin user
const updateUserService = async (id, body = {}) => {
    try {
        const query = `
        UPDATE user 
        SET 
            username = ?, 
            password = ?, 
            fullName = ?, 
            phoneNumber = ?, 
            email = ?, 
            num_following = ?, 
            num_followers = ?, 
            num_like = ?, 
            avatar = ?, 
            role = ?, 
            followings = ?, 
            followers = ?
        WHERE user_id = ?
    `;
        const [result] = await db.query(query, body);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteUserService = async (id) => {
    const query = `DELETE FROM user WHERE user_id = ?`;
    const [result] = await db.query(query, [id]);
    return result;
};

const deleteListUserService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Danh sách ID không hợp lệ');
    }

    // Tạo chuỗi tham số cho câu truy vấn SQL
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM user WHERE user_id IN (${placeholders})`;

    const [result] = await db.query(query, ids);
    return result;
};

//set following
const setFollowingService = async (data) => {
    const query = `UPDATE user SET followings = ? WHERE user_id = ?`
    const [results] = await db.query(query, data);
    return results[0] || null;
};

//set follower
const setFollowerService = async (data) => {
    const query = `UPDATE user SET followers = ? WHERE user_id = ?`
    const [results] = await db.query(query, data);
    return results[0] || null;
};


module.exports = {
    loginService,
    setFollowingService,
    setFollowerService,
    getUsersService,
    findByIdUserService,
    updateUserService,
    createUserService,
    deleteUserService
}