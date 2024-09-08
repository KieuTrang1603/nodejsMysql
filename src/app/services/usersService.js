const db = require("../../config/db");

//login
const loginService = async (data) => {
    const query = `SELECT * FROM user WHERE (email = ? OR username = ?) AND password = ? LIMIT 1`;
    const [results] = await db.query(query, data);
    return results[0] || null;
};

const createUserService = async (body) => {
    const [result] = await db.query(`
        INSERT INTO 
        user (user_id, username, password, fullName, phoneNumber, email) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        body
    );
    return result;
};

const findByIdUserService = async (id) => {
    const query = `SELECT * FROM user WHERE user_id = ?`;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
};

const getUsersService = async (searchObject = {}) => {
    let { searchTerm = '', pageIndex = 1, pageSize = 10 } = searchObject;
    const offset = (pageIndex - 1) * pageSize;

    let dataSearch = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

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

const updateByIdUserService = async (id, body) => {
    const { name, email, city } = body;
    const query = `
        UPDATE user
        SET name = ?, email = ?, city = ?
        WHERE user_id = ?`;

    const [result] = await db.query(query, [name, email, city, id]);
    return result;
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
    updateByIdUserService,
    createUserService,
    deleteUserService
}