import  bcryptjs  from "bcryptjs";
import User from "../models/user.model.js";
import  jwt  from "jsonwebtoken";
export const loginhandeler = async (req, res) => {
  const { email, password } = req.body;
  const match = await User.findOne({ email });
  if (!match) {
    return res.status(404).json({ success: false, message: "User not found" });
  } else {
    const isMatch = await bcryptjs.compare(password, match.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    } else {
      const payload = {
        userID: match._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token)
        .status(200)
        .json({ success: true, message: "login success" });
    }
  }
};
export const signuphandeler = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create the user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role, // Role is explicitly passed from the form
    });

    // Create a JWT token
    const payload = {
      userID: newUser._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the cookie and respond
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logouthandeler = (req, res) => {
    res
        .cookie("token", null, {
            expires: new Date(0),        // Expire the cookie
            httpOnly: true,              // Make sure it's only accessible by HTTP(S), not client-side JavaScript
            secure: process.env.NODE_ENV === 'production',  // Set to true if you're in production (use HTTPS)
            sameSite: 'strict',          // Ensure the cookie is sent only in a first-party context
        })
        .json({ success: true, message: "User logged out" });
  };
  
  
// profile.controller.js or wherever you define your route handler

export const profile = (req, res) => {
  // Send the user information that was attached to the request by the `isAuthenticated` middleware
  res.json({
    success: true,
    user: req.user, // The user info is available here
  });
};
