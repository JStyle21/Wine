"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestions = exports.getProducts = exports.addProduct = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, fav, purchased, wineType, grapeVariety, dryness } = req.body;
        const newProduct = new Product_1.default({ name, description, price, fav, purchased, wineType, grapeVariety, dryness });
        yield newProduct.save();
        res.status(201).json(newProduct);
    }
    catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            res.status(409).json({ message: 'Conflict: Product with this name already exists.', field: 'name' });
        }
        else {
            next(error);
        }
    }
});
exports.addProduct = addProduct;
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, wineType, dryness, fav, purchased, sortBy, order = 'asc', limit } = req.query;
        const query = {};
        if (search && typeof search === 'string') {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { name: regex },
                { description: regex },
                { grapeVariety: regex },
            ];
        }
        if (wineType) {
            query.wineType = wineType;
        }
        if (dryness) {
            query.dryness = dryness;
        }
        if (fav !== undefined) {
            query.fav = fav === 'true';
        }
        if (purchased !== undefined) {
            query.purchased = purchased === 'true';
        }
        const totalCount = yield Product_1.default.countDocuments();
        const stats = yield Product_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: { $cond: [{ $eq: ["$purchased", true] }, "$price", 0] } },
                    totalLiked: { $sum: { $cond: [{ $eq: ["$fav", true] }, 1, 0] } }
                }
            }
        ]);
        const { totalSpent = 0, totalLiked = 0 } = stats[0] || {};
        if (limit && parseInt(limit, 10) === 0) {
            res.status(200).json({ products: [], totalCount, totalSpent, totalLiked });
            return;
        }
        let sortOptions = {};
        if (typeof sortBy === 'string') {
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        }
        else {
            sortOptions = { createdAt: -1 };
        }
        const products = yield Product_1.default.find(query).sort(sortOptions);
        res.json({ products, totalCount, totalSpent, totalLiked });
    }
    catch (error) {
        next(error);
    }
});
exports.getProducts = getProducts;
const getSuggestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        if (!query || typeof query !== 'string') {
            res.json([]);
            return;
        }
        const regex = new RegExp(query, 'i');
        const nameSuggestions = yield Product_1.default.find({ name: regex }).limit(5).distinct('name');
        const grapeSuggestions = yield Product_1.default.find({ grapeVariety: regex }).limit(5).distinct('grapeVariety');
        const combined = [...new Set([...nameSuggestions, ...grapeSuggestions])];
        res.json(combined.slice(0, 10));
    }
    catch (error) {
        next(error);
    }
});
exports.getSuggestions = getSuggestions;
