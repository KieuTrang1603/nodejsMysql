const { v4: uuidv4 } = require('uuid');

const express = require("express");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

let urlVideo, urlImage;
const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
            cb(null, "public/assets/videos");
        } else {
            cb(new Error("File không phải là video."), false);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        urlVideo = uuidv4() + ext;
        cb(null, urlVideo)
    }
});

const storageImage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, "public/assets/image");
        } else {
            cb(new Error("not image."), false);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // urlImage = Date.now() + ext;
        urlImage = uuidv4() + ".mp4";
        cb(null, urlImage)
    }
})

const uploadFileVideo = multer({
    storage: storageVideo,
    limits: { fileSize: 50 * 1024 * 1024 }
});
const uploadFileImage = multer({
    storage: storageImage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Giới hạn kích thước file là 2MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra mime type
        // if (file.mimetype === 'image/jpg' ||
        //     file.mimetype === 'image/jpeg' ||
        //     file.mimetype === 'image/png') {
        if (file.mimetype.startsWith("image/")) {
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
        data: file?.filename,
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
        data: file?.filename,
        code: 200,
    });
}

const viewImage = (req, res, next) => {
    const imagePath = path.join(__dirname, '../../../public/assets/image', req.query.fileName);

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
            let contentType = 'image/jpeg';
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(imageData);
        });
    });
}


//lưu video chất lượng cao
const convertVideoToHLS = (inputPath, outputDir, callback) => {
    const resolutions = [
        { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
        { name: '720p', width: 1280, height: 720, bitrate: '3000k' },
        { name: '480p', width: 854, height: 480, bitrate: '1500k' }
    ];

    // Lệnh ffmpeg cho từng chất lượng
    const commands = resolutions.map(res => {
        return spawn(ffmpegPath, [
            '-i', inputPath,                           // Input video
            '-vf', `scale=w=${res.width}:h=${res.height}`,  // Thay đổi độ phân giải video
            '-c:v', 'libx264',                         // Codec video
            '-b:v', res.bitrate,                       // Bitrate của video
            '-hls_time', '10',                         // Thời lượng mỗi chunk là 10s
            '-hls_playlist_type', 'vod',               // Playlist cho VOD
            '-f', 'hls',                               // Định dạng đầu ra HLS
            path.join(outputDir, `${res.name}_playlist.m3u8`) // Playlist đầu ra cho mỗi chất lượng
        ]);
    });

    let finished = 0;
    const totalCommands = commands.length;
    commands.forEach((command, index) => {
        command.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        command.on('close', (code) => {
            if (code === 0) {
                finished++;
                if (finished === totalCommands) {
                    // Khi tất cả lệnh ffmpeg hoàn thành, tạo master playlist
                    createMasterPlaylist(outputDir, resolutions);
                    callback(null, path.join(outputDir, 'master.m3u8'));
                }
            } else {
                callback(new Error('Lỗi trong quá trình chuyển đổi video sang HLS'));
            }
        });
    });
};

const createMasterPlaylist = (outputDir, resolutions) => {
    const masterPlaylistContent = [
        '#EXTM3U',
        '#EXT-X-VERSION:3',
        ...resolutions.map(res => {
            const bandwidth = parseInt(res.bitrate) * 1000;
            return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${res.width}x${res.height}\n${res.name}_playlist.m3u8`;
        }),
    ].join('\n');

    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);
};


const createSingleFileVideoHLS = async (req, res, next) => {
    const file = req.file;

    if (!file || file.length <= 0) {
        return next(new Error("Lỗi upload file video"));
    }

    const videoPath = path.join(__dirname, "../../../public/assets/videos", file.filename);
    const hlsOutputDir = path.join(__dirname, "../../../public/assets/hls", file?.filename?.split('.')?.[0] || uuidv4());

    fs.mkdirSync(hlsOutputDir, { recursive: true });

    convertVideoToHLS(videoPath, hlsOutputDir, (err, playlistPath) => {
        if (err) {
            return next(err);
        }

        res.json({
            message: "Upload và chuyển đổi thành công",
            data: `${path.basename(hlsOutputDir)}`,
            // playlistUrl: `/hls/${path.basename(hlsOutputDir)}/master.m3u8`,
            code: 200
        });
    });
};

const viewFileVideoHLS = (req, res, next) => {
    const hlsDir = path.join(__dirname, "../../../public/assets/hls", req.params.hlsId);
    const fileName = req.params.segment;

    const filePath = path.join(hlsDir, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ code: 404, message: "File không tìm thấy" });
    }

    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/vnd.apple.mpegurl';  // Default cho .m3u8
    if (ext === '.ts') contentType = 'video/mp2t';  // Cho các tệp .ts

    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).json({ code: 500, message: "Không đọc được file" });
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
};

module.exports = {
    createSingleFileVideo,
    createSingleImage,
    uploadFileImage,
    uploadFileVideo,
    viewFileVideo,
    viewImage,
    createSingleFileVideoHLS,
    viewFileVideoHLS,
}