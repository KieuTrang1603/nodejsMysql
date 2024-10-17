const {
    getUsersService,
    createUserService,
    findByIdUserService,
    setFollowingService,
    loginService,
    updateUserService,
    checkUserExists,
    setFollowerService,
    deleteUserService,
    deleteListUserService
} = require("../services/usersService");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    let { username, password } = req.body;
    const dataBody = [username, username, password]
    let user = await loginService(dataBody);

    if (!user) {
        return res.json({
            code: 300,
            message: "Tài khoản không đúng",
            data: {}
        });
    }

    let token = jwt.sign({ _id: user?.user_id }, 'mk', { expiresIn: '1h' });

    // Lưu token vào cookie
    res.cookie('Token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + (1 * 60 * 60 * 1000)) // Expires in 1 hour
    });

    // Trả về response
    return res.json({
        code: 200,
        message: "Thành công",
        token: token,
        data: user
    });
};

const getUser = async (req, res, next) => {
    try {
        let data = await getUsersService(req.query);
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

const createUser = async (req, res, next) => {
    const user_id = uuidv4();

    const {
        username,
        password,
        fullName,
        phoneNumber,
        email,
        num_following,
        num_followers,
        num_like,
        avatar,
        followings,
        followers
    } = req.body;

    let dataInsert = [
        user_id,
        username,
        password,
        fullName,
        phoneNumber,
        email,
        num_following || 0,
        num_followers || 0,
        num_like || 0,
        avatar || null,
        0, //role user
        followings || null,
        followers || null,
    ]

    try {

        // Kiểm tra trùng username và email trước khi tạo mới
        const userExists = await checkUserExists(username, email);

        // Nếu username bị trùng
        if (userExists.usernameExists && userExists.emailExists) {
            return res.status(400).json({
                code: 400,
                message: 'Username and Email already exists'
            });
        } else if (userExists.usernameExists) {
            return res.status(400).json({
                code: 400,
                message: 'Username already exists'
            });
        } else if (userExists.emailExists) {
            return res.status(400).json({
                code: 400,
                message: 'Email already exists'
            });
        }

        await createUserService(dataInsert);
        let item = await findByIdUserService(user_id);

        res.json({
            code: 200,
            message: 'Employee created successfully',
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

const getByIdUser = async (req, res, next) => {
    const { user_id } = req.params;
    const { isListFollower = false } = req.query
    try {
        let item = await findByIdUserService(user_id, isListFollower);
        res.json({
            code: 200,
            message: 'Get by id user successfully',
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

const updateUser = async (req, res, next) => {
    const { user_id } = req.params;

    const {
        username,
        password,
        fullName,
        phoneNumber,
        email,
        num_following,
        num_followers,
        num_like,
        avatar,
        role,
        followings,
        followers
    } = req.body;

    let dataUpdate = {};

    if (username) dataUpdate.username = username;
    if (password) dataUpdate.password = password;
    if (fullName) dataUpdate.fullName = fullName;
    if (phoneNumber) dataUpdate.phoneNumber = phoneNumber;
    if (email) dataUpdate.email = email;
    if (typeof num_like !== 'undefined') dataUpdate.num_like = num_like;
    if (avatar) dataUpdate.avatar = avatar;
    if (role) dataUpdate.role = role;
    if (followings) {
        dataUpdate.num_following = followings.length;
        dataUpdate.followings = JSON.stringify(followings);

    }
    if (followers) {
        dataUpdate.num_followers = followers.length;
        dataUpdate.followers = JSON.stringify(followers);
    }

    try {
        const result = await updateUserService(user_id, dataUpdate);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'User not found',
            });
        }

        let updatedItem = await findByIdUserService(user_id);

        res.json({
            code: 200,
            message: 'User updated successfully',
            data: updatedItem
        });

    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating user',
            error: error.message
        });
    }
}

const updateUserAvatar = async (req, res, next) => {
    const { user_id } = req.params;
    const { avatar } = req.body;

    let dataUpdate = {};
    if (avatar) dataUpdate.avatar = avatar;

    try {
        const result = await updateUserService(user_id, dataUpdate);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'User not found',
            });
        }

        let updatedItem = await findByIdUserService(user_id);

        res.json({
            code: 200,
            message: 'User updated successfully',
            data: updatedItem
        });

    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating user',
            error: error.message
        });
    }
}

const deleteUser = async (req, res, next) => {
    const { user_id } = req.params;

    try {
        const result = await deleteUserService(user_id);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'User not found',
            });
        }

        res.json({
            code: 200,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting notification',
            error: error.message
        });
    }
}

const deleteUsers = async (req, res, next) => {
    const { ids } = req.query;
    const user_ids = ids.split(',');

    try {
        // Kiểm tra nếu không có danh sách ID hoặc mảng trống
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Comment IDs not provided or invalid',
            });
        }

        // Xóa các comment và tất cả các comment con
        console.log(user_ids)
        const result = await deleteListUserService(user_ids);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comments not found',
            });
        }

        res.json({
            code: 200,
            message: 'Comments deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting comments',
            error: error.message,
        });
    }
};

//follow
const follow = async (req, res, next) => {
    try {
        const { following_id, user_id, isFollow = true } = req.body;

        if (!(following_id && user_id)) {
            res.status(400).json({
                code: 400,
                message: 'Lỗi dữ liệu',
                data: null
            });
            return;
        }

        //following
        let userFollowing = await findByIdUserService(user_id);
        let followings = userFollowing?.followings || [];

        let indexFollowings = followings?.findIndex(item => item === following_id)
        if (!(indexFollowings > -1)) {
            followings.push(following_id);
            await setFollowingService([JSON.stringify(followings), followings?.length, user_id]);
        } else {
            followings.splice(indexFollowings, 1);
            await setFollowingService([JSON.stringify(followings), followings?.length, user_id]);
        }

        //follower
        let userFollower = await findByIdUserService(following_id);
        let followers = userFollower?.followers || [];

        let indexFollowers = followers?.findIndex(item => item === user_id)
        if (!(indexFollowers > -1)) {
            followers.push(user_id);
            await setFollowerService([JSON.stringify(followers), followers?.length, following_id]);
        } else {
            followers.splice(indexFollowers, 1);
            await setFollowerService([JSON.stringify(followers), followers?.length, following_id]);
        }

        let updatedItem = await findByIdUserService(user_id);

        return res.json({
            code: 200,
            message: `Đã ${(indexFollowings > -1) ? "bỏ " : ""}follow ${userFollower?.fullName || ""}`,
            data: {
                ...updatedItem,
                isFollow: !(indexFollowings > -1)
            }
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

module.exports = {
    getUser,
    createUser,
    follow,
    login,
    getByIdUser,
    updateUser,
    deleteUser,
    deleteUsers,
    updateUserAvatar
}