const { response } = require("express");
const db = require("../models");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

//create model
const User = db.users;

//addUser
const addUser = async (req, res) => {
  try {
    const { name, image, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name,
      image: image,
      email: email,
      hashedPassword: password,
      role: role,
    });

    res.status(200).send({ message: "Successfully added user", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//login
const login = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  try {
    // Get user by email
    let user = await User.findOne({ where: { email: email } });

    if (!user) {
      // If no user found with the provided email
      return res.status(404).send({ message: "User not found" });
    }

    // Compare the hashedPassword from the database with the provided password
    const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordMatch) {
      // If passwords do not match
      return res.status(401).send({ message: "Incorrect password" });
    }

    const expiresIn = 60 * 60; // 1 hour in seconds
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

    const token = sign(
      { id: user.id, email: user.email, image: user.image, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: expiresIn }
    );

    const refreshToken = sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    await User.update(
      { refreshToken: refreshToken },
      { where: { email: email } }
    );

    res.status(200).send({
      message: "Login successful",
      token: token,
      refreshToken: refreshToken,
      expiresIn: expirationTime,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    // Check if refresh token is provided
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    try {
      // Verify the refresh token
      const decoded = verify(
        refreshToken,
        "5e56eb7c135eb724d9f588ae1b46317f56a5d3e16284471a28002c81e73c2c15"
      );

      // Retrieve user details based on the refresh token
      const user = await User.findOne({
        where: { id: decoded.id, email: decoded.email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a new access token
      const accessToken = sign(
        { id: user.id, email: user.email, role: user.role, image: user.image },
        "fh3H5y8Sm91brlh2chNXZqeihWBP7KdX",
        { expiresIn: "1h" }
      );

      // Prepare the response with the new access token and user data
      let refreshTokenResponse = {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name, // Assuming user model has a name attribute
          // Include any other relevant user data
        },
      };

      // If the user's role is TEACHER, include the teacherId in the response
      if (user.role === "TEACHER") {
        const teacherInfo = await teacherInformation.findOne({
          where: { userEmail: user.email },
        });
        refreshTokenResponse.user.teacherId = teacherInfo
          ? teacherInfo.id
          : null;
      }

      // If the user's role is STUDENT, include the studentId in the response
      if (user.role === "STUDENT") {
        const studentInfo = await studentInformation.findOne({
          where: { userEmail: user.email },
        });
        refreshTokenResponse.user.studentId = studentInfo
          ? studentInfo.id
          : null;
      }

      res.status(200).json(refreshTokenResponse);
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getUserByToken = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["hashedPassword", "refreshToken"] },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const editUser = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const { name, email } = req.body;
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.name = name;
    user.email = email;

    await user.save();

    res.status(200).send({ message: "User data updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    const fileName = req.file.filename;

    if (user.image) {
      const existingImagePath = path.join("public/profileImg/", user.image);
      if (fs.existsSync(existingImagePath)) {
        fs.unlinkSync(path.join("public/profileImg", user.image));
      }
    }

    user.image = fileName;
    await user.save();

    res
      .status(200)
      .send({ message: "Profile photo updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  addUser,
  login,
  getUserByToken,
  editUser,
  refreshToken,
  uploadProfilePhoto,
};
