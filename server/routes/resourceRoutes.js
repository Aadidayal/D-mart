const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataFolder = path.join(__dirname, "../data");
const resourcesFilePath = path.join(dataFolder, "resources.json");

// ✅ Ensure `data` folder and `resources.json` file exist
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true }); // Create folder if missing
}
if (!fs.existsSync(resourcesFilePath)) {
    // ✅ Add default food items if file doesn't exist
    const defaultResources = [
        { "id": 1, "name": "Vegetable Kung Pao", "price": 915.17 },
        { "id": 2, "name": "Vegetable Fried Rice", "price": 747.17 },
        { "id": 3, "name": "Vegetable Tacos", "price": 290.50 },
        { "id": 4, "name": "Vegetable Samosas", "price": 414.17 },
        { "id": 5, "name": "Margherita Pizza", "price": 1078.17 },
        { "id": 6, "name": "Chocolate Lava Cake", "price": 581.17 },
        { "id": 7, "name": "Vegetable Biryani", "price": 496.17 },
        { "id": 8, "name": "Vegetable Ramen", "price": 829.17 }
    ];
    fs.writeFileSync(resourcesFilePath, JSON.stringify(defaultResources, null, 2), "utf8");
}

// ✅ Load resources from `resources.json`
let storage = { resources: JSON.parse(fs.readFileSync(resourcesFilePath, "utf8")) };

// ✅ Save resources to `resources.json`
function saveResources() {
    fs.writeFileSync(resourcesFilePath, JSON.stringify(storage.resources, null, 2), "utf8");
}

// ✅ Retrieve all resources
router.get("/", (req, res) => {
    res.json(storage.resources);
});

// ✅ Retrieve a specific resource by ID
router.get("/:id", (req, res) => {
    const resource = storage.resources.find(r => r.id === parseInt(req.params.id));
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
});

// ✅ Add a new resource and save it
router.post("/", (req, res) => {
    const { name, description, price, image } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required" });
    }

    const newResource = {
        id: storage.resources.length + 1,
        name,
        description: description || "No description available",
        price: parseFloat(price),
        image: image || "https://via.placeholder.com/150"
    };

    storage.resources.push(newResource);
    saveResources(); // ✅ Save to `resources.json`

    res.status(201).json({ message: "Resource added", resource: newResource });
});

// ✅ Update an existing resource
router.put("/:id", (req, res) => {
    const resource = storage.resources.find(r => r.id === parseInt(req.params.id));
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const { name, description, price, image } = req.body;

    if (name) resource.name = name;
    if (description) resource.description = description;
    if (price) resource.price = parseFloat(price);
    if (image) resource.image = image;

    saveResources(); // ✅ Save changes to `resources.json`
    res.json({ message: "Resource updated", resource });
});

// ✅ Delete a resource
router.delete("/:id", (req, res) => {
    const index = storage.resources.findIndex(r => r.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Resource not found" });

    storage.resources.splice(index, 1);
    saveResources(); // ✅ Save changes to `resources.json`

    res.json({ message: "Resource deleted" });
});

// ✅ Export the router
module.exports = router;
