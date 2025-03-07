const fs = require("fs");
const path = require("path");

// ✅ Define file paths
const usersFilePath = path.join(__dirname, "users.json");
const resourcesFilePath = path.join(__dirname, "resources.json");
const cartFilePath = path.join(__dirname, "cart.json");

// ✅ Ensure JSON files exist
function ensureFileExists(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
            console.log(`✅ Created ${filePath} with default data.`);
        } catch (error) {
            console.error(`❌ Error creating ${filePath}:`, error);
        }
    }
}

// ✅ Ensure all files exist before loading data
ensureFileExists(usersFilePath, []);
ensureFileExists(resourcesFilePath, []);
ensureFileExists(cartFilePath, []);

// ✅ Load Data with Error Handling
function loadData(filePath, defaultValue) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data) || defaultValue;
    } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error);
        return defaultValue;
    }
}

// ✅ Initialize storage
let storage = {
    users: loadData(usersFilePath, []),
    resources: loadData(resourcesFilePath, []),
    cartData: loadData(cartFilePath, []) // ✅ Using `cartData` instead of `relationships`
};

// ✅ Save Functions with Error Handling
function saveData(filePath, data, dataType) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        console.log(`✅ Successfully saved ${dataType} data.`);
    } catch (error) {
        console.error(`❌ Error saving ${dataType} data:`, error);
    }
}

function saveUsers() {
    saveData(usersFilePath, storage.users, "Users");
}

function saveResources() {
    saveData(resourcesFilePath, storage.resources, "Resources");
}

function saveCart() {
    saveData(cartFilePath, storage.cartData, "Cart");
}

// ✅ Debugging: Log initial data on server start
console.log("🔍 Initial Users Data:", storage.users);
console.log("🔍 Initial Resources Data:", storage.resources);
console.log("🔍 Initial Cart Data:", storage.cartData);

module.exports = { storage, saveUsers, saveResources, saveCart };
