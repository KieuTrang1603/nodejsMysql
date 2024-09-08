const {
    getUsersService,
    createUserService,
    findByIdUserService,
    setFollowingService,
    setFollowerService,
    loginService
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
        let data = await getUsersService();
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
    const { username, password, fullName, phoneNumber, email, } = req.body;
    let dataInsert = [user_id, username, password, fullName, phoneNumber, email]

    try {
        const data = await createUserService(dataInsert)
        res.json({
            code: 200,
            message: 'Employee created successfully',
            data: { ...dataInsert }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}
const getByIdUser = (req, res, next) => {

}
const updateUser = (req, res, next) => {

}
const deleteUser = async (req, res, next) => {

}

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
            await setFollowingService([JSON.stringify(followings), user_id]);
        } else if (!isFollow) {
            followings.splice(indexFollowings, 1);
            await setFollowingService([JSON.stringify(followings), user_id]);
        }

        //following
        let userFollower = await findByIdUserService(following_id);
        let followers = userFollower?.followers || [];

        let indexFollowers = followers?.findIndex(item => item === user_id)
        if (!(indexFollowers > -1)) {
            followers.push(user_id);
            await setFollowingService([JSON.stringify(followings), user_id]);
        } else if (!isFollow) {
            followers.splice(indexFollowers, 1);
            await setFollowingService([JSON.stringify(followers), following_id]);
        }

        return res.json({
            code: 200,
            message: `Đã ${!isFollow ? "bỏ " : ""}follow ${userFollower?.fullName || ""}`,
            data: {
                ...userFollowing,
                followings
            },
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
    getByIdUser: getByIdUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
}