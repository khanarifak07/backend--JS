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

export { registerUser };
