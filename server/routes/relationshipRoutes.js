const express = require("express");
const router = express.Router();
const { storage, saveCart } = require("../data/storage");

// ✅ Debugging: Check if cart data is loaded correctly
console.log("🔍 Initial Cart Data:", storage.cartData || []);

// ✅ Get Cart Items for a User
router.get("/cart/:userId", (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        console.log(`📦 Fetching cart for user: ${userId}`);

        // ✅ Ensure cartData exists
        storage.cartData = Array.isArray(storage.cartData) ? storage.cartData : [];

        // ✅ Fetch user-specific cart items
        const userCart = storage.cartData
            .filter(item => item.userId === userId)
            .map(item => {
                const resource = storage.resources.find(r => r.id === item.resourceId) || {};
                return {
                    ...item,
                    resourceName: resource.name || "Unknown Item",
                    price: resource.price || 0
                };
            });

        res.json(userCart);
    } catch (error) {
        console.error("🚨 Error fetching cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.toString() });
    }
});

// ✅ Add or Remove Item from Cart
router.post("/cart", (req, res) => {
    try {
        const { userId, resourceId, quantityChange } = req.body;

        if (!userId || !resourceId || quantityChange === undefined) {
            return res.status(400).json({ message: "User ID, resource ID, and quantity change are required" });
        }

        console.log(`📤 Updating cart for User ${userId}, Item ${resourceId}, Change ${quantityChange}`);

        // ✅ Ensure storage.cartData is an array
        storage.cartData = Array.isArray(storage.cartData) ? storage.cartData : [];

        let item = storage.cartData.find(r => r.userId === userId && r.resourceId === resourceId);

        if (item) {
            item.quantity += quantityChange;
            if (item.quantity <= 0) {
                storage.cartData = storage.cartData.filter(r => !(r.userId === userId && r.resourceId === resourceId));
                saveCart();
                return res.json({ message: "Item removed from cart", newQuantity: 0 });
            }
            saveCart();
            return res.json({ message: "Item updated in cart", newQuantity: item.quantity });
        } else if (quantityChange > 0) {
            storage.cartData.push({ userId, resourceId, quantity: quantityChange });
            saveCart();
            return res.json({ message: "Item added to cart", newQuantity: quantityChange });
        }

        res.json({ message: "No changes made" });

    } catch (error) {
        console.error("🚨 Error updating cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.toString() });
    }
});

// ✅ Clear Cart for a User
router.delete("/cart/:userId", (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        console.log(`🗑️ Clearing cart for user: ${userId}`);

        storage.cartData = storage.cartData.filter(item => item.userId !== userId);
        saveCart();

        res.json({ message: "Cart cleared" });
    } catch (error) {
        console.error("🚨 Error clearing cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.toString() });
    }
});

module.exports = router;
