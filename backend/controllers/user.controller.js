import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import fs from "fs";
import { parseResume } from "../services/resumeParser.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        let profilePhoto = "";
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhoto,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET || process.env.SECRET_KEY, { expiresIn: '7d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills, experience, education, certifications } = req.body;

        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        const file = req.file;
        let resume = "";
        let resumeOriginalName = "";
        let autoExtractedData = {};

        if (file) {
            const fileUri = getDataUri(file);

            // IMPROVEMENT: Parse resume LOCALLY before uploading to Cloudinary
            // This ensures we get the data even if Cloudinary access is restricted later
            try {
                // Since it's a Buffer, we can't pass the path directly to parseResume if it expects a path
                // But our parseResume handles local paths. Let's send a temp path or update parseResume to handle buffers.
                // Actually, let's just use the file object directly for a temp check or update parseResume.
                const tempPath = `./uploads/temp_${userId}_${Date.now()}.pdf`;
                fs.writeFileSync(tempPath, file.buffer);
                autoExtractedData = await parseResume(tempPath) || {};
                fs.unlinkSync(tempPath); // Clean up
            } catch (err) {
                console.error("Local parsing error:", err.message);
            }

            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                access_mode: 'public',
                resource_type: 'auto'
            });
            resume = cloudResponse.secure_url;
            resumeOriginalName = file.originalname;
        }

        let skillsArray;
        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        if (skills) {
            skillsArray = skills.split(",").map(s => s.trim());
            user.profile.skills = skillsArray;
        }
        if (experience !== undefined) user.profile.experience = Number(experience)
        if (education) user.profile.education = education
        if (certifications) {
            user.profile.certifications = Array.isArray(certifications)
                ? certifications
                : certifications.split(",").map(c => c.trim());
        }

        if (file) {
            user.profile.resume = resume // save the local url
            user.profile.resumeOriginalName = resumeOriginalName // Save the original file name

            // Use auto-extracted data if manual data is missing
            if ((experience === undefined || experience === "") && autoExtractedData.experience) {
                user.profile.experience = autoExtractedData.experience;
            }
            if (!education && autoExtractedData.education && autoExtractedData.education !== "Not Specified") {
                user.profile.education = autoExtractedData.education;
            }
            if ((!certifications || certifications.length === 0) && autoExtractedData.certifications?.length > 0) {
                user.profile.certifications = autoExtractedData.certifications;
            }
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const bookmarkJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (!user.profile.bookmarks) {
            user.profile.bookmarks = [];
        }

        const isBookmarked = user.profile.bookmarks.includes(jobId);
        if (isBookmarked) {
            // Remove from bookmarks
            user.profile.bookmarks = user.profile.bookmarks.filter(id => id.toString() !== jobId);
        } else {
            // Add to bookmarks
            user.profile.bookmarks.push(jobId);
        }

        await user.save();

        return res.status(200).json({
            message: isBookmarked ? "Job removed from bookmarks" : "Job bookmarked successfully",
            bookmarks: user.profile.bookmarks,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password", success: false });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: "Password changed successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};