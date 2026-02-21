const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  createHouse,
  getApprovedHouses,
  getOwnerHouses,
  getPendingHouses,
  approveHouse,
  rejectHouse,
  deleteHouse,
} = require("../controllers/houseController");

cloudinary.config({
  cloud_name: 'dtuk9wroa',
  api_key: '924997523136899',
  api_secret: 'MJPouU1RlxyUAvHvynab0-Naqz4',
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// PUBLIC ROUTES
router.get("/", getApprovedHouses);

// OWNER - CREATE HOUSE
router.post("/", auth, upload.array("images"), async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "properties" },
            (error, result) => {
              if (result) resolve(result.secure_url);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      };

      // upload all files
      imageUrls = await Promise.all(req.files.map(file => uploadToCloudinary(file)));
    }

    // attach images to req.body for controller
    req.images = imageUrls;

    // call original controller
    await createHouse(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "House creation failed" });
  }
});

router.get("/my-houses", auth, getOwnerHouses);

// ADMIN ROUTES
router.get("/pending", auth, admin, getPendingHouses);
router.patch("/:id/approve", auth, admin, approveHouse);
router.patch("/:id/reject", auth, admin, rejectHouse);

// OWNER / ADMIN
router.delete("/:id", auth, deleteHouse);

module.exports = router;