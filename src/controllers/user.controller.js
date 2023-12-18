import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApriError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend  --> we can get the user details from req.body (for form and json we can req.body for URL its different)
  //validation - not empty
  //check user is already exist or not :username or email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entity in db (.create)
  //remove password and refresh token field from response
  //check for user creation
  //return response

  //1. taking user details
  const { username, email, fullName, password } = req.body;

  //2. Validation checking all fileds are required
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    // return res.status(400).json({ message: "One of the fields is empty" });
    throw new ApiError(400, "All fields are required");
  }

  //3.Checking users is existed or not by username and email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    // return res.status(409).json({message:"Username or Email already exists."})
    throw new ApiError(409, "Email or Username already exists.");
  }

  //4.Cheking images is there or not
  const avatarLocalPath = req.files?.avatar[0]?.path; // req.files (by multer)
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //checking for coverImage as this is optional so we getting error while req api from postman :-ReferenceError: coverImageLocalPath is not defined
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    // return res.status(400).json({ message: "Avatar is requied" });
    throw new ApiError(400, "Avatar is required");
  }

  //5. After checking upload the image in cloudinary
  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "Avatar is required");
  }

  //6. Creating user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  //7. Removing the password and refreshToken fileds by using select mehthod
  const createdUser = await User.findById(user._id).select(
    //select is used to remove the given fields in string
    "-password -refreshToken"
  );
  //8. Checking for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  //9. Everything is check now sending response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//Generate access and refresh token mehthod
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken;
    const refreshToken = user.generateRefreshToken;

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //1.req.body -- data
  //2.usernmae or email for login
  //3.Check user is existed or not
  //4.Password check
  //5.Access and refresh token
  //6.Send tokens is cookies
  //7.Send response as successfull login

  const { username, password, email } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username and email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User is not found");
  }

  const isPasswordValidate = user.isPasswordCorrect(password);
  if (!isPasswordValidate) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //for sending cookies we need set some option
  //setting httpOnly and secure true that means this cookies is only modified from server only not from client side
  const options = {
    httpOnly: true,
    secure: true,
  };
  //now send the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //1.for logout we need to take user from cookies for that we need to write auth middleware so that we have req.user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //1.get the refresh token via cookies and body
  //2.Checking the refresh token
  //3.verify the refresh token via jwt.verify so that we can get decoded Token
  //4.then we can get the user id via decodedToken
  //5.Now need to compare both refres tokens
  //6.Then we can add option for cookies
  //7.Then we can call the generate token funtions
  //8.Then we can send the response
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_ACCESS_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token is expires or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { loginUser, logoutUser, registerUser , refreshAccessToken};
