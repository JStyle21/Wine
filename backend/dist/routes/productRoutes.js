"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.post('/products', productController_1.addProduct);
router.get('/products', productController_1.getProducts);
router.get('/products/suggestions', productController_1.getSuggestions);
exports.default = router;
