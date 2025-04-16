const express = require("express");
const cors = require("cors");

// ✅ Initialize Express App FIRST
const app = express();
const PORT = process.env.PORT || 5000; // Dynamically use available port

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Parses JSON body

// ✅ Import Routes (AFTER initializing app)
const resourceRoutes = require("./routes/resourceRoutes");
const userRoutes = require("./routes/userRoutes");
const relationshipRoutes = require("./routes/relationshipRoutes");
const sellerRoutes = require('./routes/sellerRoutes');
    

// ✅ Root API Test
app.get("/", (req, res) => {
    res.send("Welcome to the In-Memory E-Commerce API!");
});

// ✅ API Routes
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/cart", relationshipRoutes); // Ensures cart-related routes work
app.use("/api/sellers", sellerRoutes);

// ✅ Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Add this to your server.js after other routes

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
