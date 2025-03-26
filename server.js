import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import customerAuth from "./routes/customer/customerAuth.js";
import sellerRoutes from "./routes/seller/sellerAuth.js";
import productRoutesSeller from "./routes/seller/productRoutesSeller.js";
import productRouteCustomer from "./routes/customer/productRouteCustomer.js";
import uploadRoutes from "./routes/uploadRoutes.js"; 
import bodyParser from "body-parser";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use(cors({ origin: "https://op-frontend-wdaj.vercel.app", credentials: true })); // Adjust the origin
app.use(express.json());



// Routes
app.use("/api/customer/auth", customerAuth);
app.use("/api/customer/products", productRouteCustomer);


app.use("/api/seller/auth", sellerRoutes);
app.use("/api/seller/products", productRoutesSeller);



// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutesSeller);












const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

