const { v4: uuidv4 } = require('uuid');

const express = require("express");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");
const path = require("path");

let urlVideo, urlImage; // Đổi tên biến cho dễ hiểu hơn
const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        // Chỉ cho phép upload các định dạng video
        if (file.mimetype === "video/mp4" ||
            file.mimetype === "video/avi" ||
            file.mimetype === "video/mkv") {
            cb(null, "public/assets/videos") // Thay đổi thư mục lưu video
            return;
        }
        cb(new Error("not video"), false); // Nếu không phải video, trả về lỗi
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // urlImage = Date.now() + ext;
        urlImage = uuidv4() + ext;
        cb(null, urlImage)
    }
});

const storageImage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png") {
            cb(null, "public/assets/image")
            return;
        }
        cb(new Error("not image"), false)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // urlImage = Date.now() + ext;
        urlImage = uuidv4() + ext;
        cb(null, urlImage)
    }
})
const uploadFileVideo = multer({ storage: storageVideo });
const uploadFileImage = multer({
    storage: storageImage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Giới hạn kích thước file là 2MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra mime type
        if (file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('File không phải là hình ảnh'));
        }
    }
});

const createSingleFileVideo = async (req, res, next) => {
    const file = req.file;

    if (!file || file.length <= 0) {
        const error = new Error("Lỗi upload file video");
        return next(error);
    }
    res.json({
        message: "Upload thành công",
        data: file,
        code: 200
    });
};

const viewFileVideo = (req, res, next) => {

    const videoPath = path.join(__dirname, "../../../public/assets/videos", req.query.fileName);

    if (!fs.existsSync(path.normalize(videoPath))) {
        return res.status(404).json({ code: 404, message: "File không tìm thấy" });
    }

    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-"); // Phân tích range từ header
        const start = parseInt(parts[0], 10); // Bắt đầu range
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1; // Kết thúc range hoặc kết thúc file nếu không có phần cuối

        if (start >= fileSize) {
            res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
            return;
        }

        const chunksize = (end - start) + 1; // Kích thước của chunk
        const file = fs.createReadStream(videoPath, { start, end }); // Tạo luồng đọc file từ vị trí start đến end
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4', // Đảm bảo trả về định dạng video đúng
        };

        res.writeHead(206, head); // Trả về mã 206 Partial Content với headers phù hợp
        file.pipe(res); // Stream video tới client
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4', // Đảm bảo trả về định dạng video đúng
        };
        res.writeHead(200, head); // Nếu không có range, trả về toàn bộ file
        fs.createReadStream(videoPath).pipe(res); // Stream toàn bộ video
    }
};

const createSingleImage = (req, res, next) => {
    const file = req.file;
    
    if (!file) {
        return res.status(400).json({
            code: 400,
            message: 'Không có file được upload'
        });
    }

    res.json({
        message: 'Upload thành công',
        data: file,
        code: 200,
        url: `/assets/image/${urlImage}`
    });
}

const viewImage = (req, res, next) => {
    // Sử dụng path.join để xây dựng đường dẫn an toàn hơn
    const imagePath = path.join(__dirname, '../../../public/assets/image', req.query.fileName);

    // Kiểm tra xem file có tồn tại không
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({
                code: 404,
                message: "Không tìm thấy file ảnh"
            });
        }

        // Đọc file ảnh
        fs.readFile(imagePath, (err, imageData) => {
            if (err) {
                return res.status(500).json({
                    code: 500,
                    message: "Không đọc được file ảnh"
                });
            }

            // Xác định Content-Type dựa trên đuôi file (có thể là jpg, png, gif...)
            const ext = path.extname(imagePath).toLowerCase();
            let contentType = 'image/jpeg'; // Mặc định là jpeg
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';

            // Trả về ảnh với Content-Type thích hợp
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(imageData);
        });
    });
}

module.exports = {
    createSingleFileVideo,
    createSingleImage,
    uploadFileImage,
    uploadFileVideo,
    viewFileVideo,
    viewImage
}