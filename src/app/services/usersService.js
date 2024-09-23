const db = require("../../config/db");

//login
const loginService = async (data) => {
    const query = `SELECT * FROM user WHERE (email = ? OR username = ?) AND password = ? LIMIT 1`;
    const [results] = await db.query(query, data);
    return results[0] || null;
};

// Hàm kiểm tra trùng username và email
const checkUserExists = async (username, email) => {
    const usernameQuery = `SELECT 1 FROM user WHERE username = ?`;
    const emailQuery = `SELECT 1 FROM user WHERE email = ?`;

    const [usernameResult] = await db.query(usernameQuery, [username]);
    const [emailResult] = await db.query(emailQuery, [email]);

    return {
        usernameExists: usernameResult.length > 0,
        emailExists: emailResult.length > 0
    };
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
const findByIdUserService = async (id, isListFollower = false) => {
    const query = `SELECT * FROM user WHERE user_id = ?`;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) return null;

    const user = results[0];
    const followersIds = user.followers || [];
    const followingsIds = user.followings || [];

    // Lấy thông tin cho những người theo dõi
    if (isListFollower) {
        if (followersIds?.length > 0) {
            const followersQuery = `SELECT * FROM user WHERE user_id IN (?)`;
            const [followersResults] = await db.query(followersQuery, [followersIds]);
            user.followers = followersResults;
        } else {
            user.followers = [];
        }

        // Lấy thông tin cho những người mà user đang theo dõi
        if (followingsIds?.length > 0) {
            const followingsQuery = `SELECT * FROM user WHERE user_id IN (?)`;
            const [followingsResults] = await db.query(followingsQuery, [followingsIds]);
            user.followings = followingsResults;
        } else {
            user.followings = [];
        }
    }
    return user;
};

//lấy ra danh sách
const getUsersService = async (searchObject = {}) => {
    let {
        keyword = '',   // Nếu không có keyword thì mặc định là chuỗi rỗng
        pageIndex = 1,  // pageIndex mặc định là 1
        pageSize = 2000   // pageSize mặc định là 2000
    } = searchObject;

    const offset = (pageIndex - 1) * pageSize;
    const hasKeyword = !!keyword;  // Kiểm tra xem có keyword hay không
    const conditions = [];  // Mảng điều kiện WHERE
    const params = [];      // Mảng tham số để truyền vào truy vấn

    // Nếu có keyword, thêm điều kiện LIKE cho username, email, phoneNumber
    if (hasKeyword) {
        conditions.push(`(username LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)`);
        const likePattern = `%${keyword}%`;
        params.push(likePattern, likePattern, likePattern);
    }

    // Tạo câu WHERE động nếu có điều kiện
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Thêm tham số phân trang
    const limit = parseInt(pageSize, 10);
    const offsetValue = parseInt(offset, 10);
    params.push(limit, offsetValue);

    // Câu truy vấn chính
    const query = `
        SELECT * FROM user
        ${whereClause}
        LIMIT ? OFFSET ?`;

    // Câu truy vấn để đếm tổng số bản ghi
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM user
        ${whereClause}`;

    try {
        // Thực hiện cả hai truy vấn đồng thời
        const [results, countResults] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, params.slice(0, params.length - 2)) // Bỏ phân trang khi đếm
        ]);

        // Lấy tổng số bản ghi từ truy vấn đếm
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

//cập nhật thông tin user
const updateUserService = async (user_id, dataUpdate = {}) => {
    try {
        let fields = [];
        let values = [];

        // Lặp qua các key-value trong dataUpdate và xây dựng câu truy vấn động
        Object.keys(dataUpdate).forEach(field => {
            fields.push(`${field} = ?`);
            values.push(dataUpdate[field]);
        });
        values.push(user_id);

        // Tạo câu truy vấn động
        const query = `
        UPDATE user 
        SET ${fields.join(', ')} 
        WHERE user_id = ?
        `;

        const [result] = await db.query(query, values);
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
    const query = `UPDATE user SET followings = ?, num_following = ? WHERE user_id = ?`
    const [results] = await db.query(query, data);
    return results[0] || null;
};

//set follower
const setFollowerService = async (data) => {
    const query = `UPDATE user SET followers = ?, num_followers = ? WHERE user_id = ?`
    const [results] = await db.query(query, data);
    return results[0] || null;
};

module.exports = {
    checkUserExists,
    loginService,
    setFollowingService,
    setFollowerService,
    getUsersService,
    findByIdUserService,
    updateUserService,
    createUserService,
    deleteUserService
}