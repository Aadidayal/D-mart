const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// ✅ Corrected `users.json` path
const usersFilePath = path.join(__dirname, "..", "data", "users.json");

// ✅ Ensure `users.json` file exists
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]", "utf8"); // Create empty users.json
}

// ✅ Load Users from `users.json`
let storage = { users: JSON.parse(fs.readFileSync(usersFilePath, "utf8")) };

// ✅ Save Users to `users.json`
function saveUsers() {
    fs.writeFileSync(usersFilePath, JSON.stringify(storage.users, null, 2), "utf8");
}

// ✅ Retrieve all users (excluding passwords)
router.get("/", (req, res) => {
    const usersWithoutPasswords = storage.users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address
    }));
    res.json(usersWithoutPasswords);
});
// ✅ Get user by ID (excluding password)
router.get("/:id", (req, res) => {
    const userId = parseInt(req.params.id, 10);

    const user = storage.users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Exclude password from the response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});


// ✅ Signup (Create a new user)
router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, password } = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json({ message: "First name, email, and password are required" });
        }

        if (storage.users.some(user => user.email === email)) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: storage.users.length + 1,
            firstName,
            lastName,
            email,
            phone,
            address,
            password: hashedPassword
        };

        storage.users.push(newUser);
        saveUsers(); // Persist user data

        console.log("✅ User registered successfully:", newUser);
        res.json({ message: "Signup successful", user: { id: newUser.id, firstName, email } });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Login with Hashed Password Verification
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = storage.users.find(user => user.email === email);
        if (!user) {
            console.log("❌ Login failed: Email not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Login failed: Incorrect password");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ User logged in successfully:", user.email);
        res.json({ message: "Login successful", user: { id: user.id, firstName: user.firstName, email } });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
