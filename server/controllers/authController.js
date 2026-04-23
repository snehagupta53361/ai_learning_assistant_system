import jwt from 'jsonwebtoken'
import User from '../models/User.js';


//Generate JWT token
const generateToken = (id) =>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

// @desc        Register new user
// @router      POST/api/auth/register,
// @access      public

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // 1. FIX: Check for BOTH email or username in the $or array
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            // Determine which one is taken for a helpful error message
            const isEmailTaken = userExists.email === email;
            
            return res.status(400).json({
                success: false,
                error: isEmailTaken ? "Email already registered" : "Username already taken",
                statusCode: 400 // FIX: Match the res.status
            });
        }

        // 2. Create user 
        // (Make sure your User Schema hashes this password before saving!)
        const user = await User.create({
            username,
            email,
            password,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: "User registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc        login user
// route        POST/api/auth/login
// access       public

export const login = async (req, res, next) =>{
    try{
        const { email, password } = req.body;

        //validate input
        if(!email || !password){
            return res.status(400).json({
                success: false,
                error: "Please provide email and password",
                statusCode: 400
            });
        }

        //check for user (include password for comparision)
        const user = await User.findOne({ email }).select("+password");

        if(!user){
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                statusCode: 401
            })
        }

        //check password
        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                statusCode: 401
            })
        }

        //Generate token for the logged in user 
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token,
            message: "Login Successful",
        })
    }
    catch(error){
        next(error);
    }
};

// @desc        getProfile
// route        GET/api/auth/profile
// access       private

export const getProfile = async (req, res, next)=>{
     try{
        const user = await User.findById(req.user._id);
        
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch(error){
        next(error);
    }
};

//@desc         updateProfile
//route         PUT/api/auth/profile
//access        private

export const updateProfile = async (req, res, next) =>{
     try{
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        //check if the new username we are updating, is taken by different user
        if(username && username !== user.username){
            const usernameExists = await User.findOne({ username });

            if(usernameExists){
                return res.status(400).json({
                    success: false,
                    error: "Username already taken",
                    message: "This username is already taken by another username"
                })

                user.username = username;
            }
        }

        //same validation for email
        if(email && user.email !== email){
            const emailExists = await User.findOne({email});

            if(emailExists){
                return res.status(400).json({
                    success: false,
                    error: "Email already exists",
                    message: "This email is already taken by another user, use different"
                })
                
                user.email = email;
            }
        }
        if(profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "Profile updated successfully"
        });
    }
    catch(error){
        next(error);
    }
};

//@desc         changePassword
//route         POST/api/auth/change-password
//access        private

export const changePassword = async (req, res, next) => {
    try{
        const { currentPassword, newPassword } = req.body;

        //validation
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success: false,
                error: "Please provide current and new password",
                statusCode: 400
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        //check current password
        const isMatch = await user.matchPassword(currentPassword);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect",
                statusCode: 401
            })
        }

        //update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    }
    catch(error){
        next(error);
    }
};
