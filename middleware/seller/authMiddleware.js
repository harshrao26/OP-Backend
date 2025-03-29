import jwt from "jsonwebtoken";
import Seller from "../../models/Seller.js";
export const verifySeller = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    if (decoded.role !== "seller") {
      return res.status(403).json({ message: "Access denied. Not a seller." });
    }

    req.sellerId = decoded.id;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifySeller2 = async (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging log

    // Find seller in the database
    const seller = await Seller.findById(decoded.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Assign seller details to `req.user`
    req.user = { id: seller._id.toString(), role: decoded.role }; // Ensure it's a string
    console.log("req.user inside verifySeller:", req.user); // Debugging log

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(400).json({ success: false, message: "Invalid token" });
  }
};
export const isApproved = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    if (seller.accountStatus === "Approved") {
      return next();
    } else {
      return res.status(403).json({ message: "Account not approved yet" });
    }
  } catch (error) {
    console.error("Error fetching seller:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};



