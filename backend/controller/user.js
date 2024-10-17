const express = require("express");
const path = require("path");
const User = require("../model/user");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
// const jwt = require("jsonwebtoken");
// const sendMail = require("../utils/sendMail");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const sendToken = require("../utils/jwtToken");
// const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try{
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      // if user already exits account is not create and file is deleted
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }else{
          res.json({message: "File deleted"})
        }
      });
      return next(new ErrorHandler("User already exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
    };

    const newUser = await User.create(user);
    res.status(201).json({
      sucess: true,
      newUser,
    });
  } catch (error){
    return next(new ErrorHandler(error.message), 400);
  }

});

module.exports = router;
