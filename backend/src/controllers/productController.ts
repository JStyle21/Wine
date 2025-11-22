import express from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const addProduct: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const {
      name, description, price, liked, bought, type, country, wineType, grapeType,
      kosher, alcoholPercent, url, tags, picture, pickupRange, pickupStatus,
      reviewed, interested, quantityBought, quantityLeft, dateOfPurchase
    } = req.body;

    const newProduct = new Product({
      name, description, price, liked, bought, type, country, wineType, grapeType,
      kosher, alcoholPercent, url, tags, picture, pickupRange, pickupStatus,
      reviewed, interested, quantityBought, quantityLeft, dateOfPurchase,
      user: req.userId
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Conflict: Product with this name already exists.', field: 'name' });
    } else {
      next(error);
    }
  }
};

export const getProducts: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { search, type, country, wineType, fav, purchased, tags, sortBy, order = 'asc', limit, year, reviewed, interested } = req.query;

    const query: any = { user: req.userId };

    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { grapeType: regex },
        { tags: regex },
      ];
    }

    if (type) query.type = type;
    if (country) query.country = country;
    if (wineType) query.wineType = wineType;
    if (tags) query.tags = { $in: [tags] };
    if (fav !== undefined) query.liked = fav === 'true';
    if (purchased !== undefined) query.bought = purchased === 'true';
    if (reviewed !== undefined) query.reviewed = reviewed === 'true';
    if (interested !== undefined) query.interested = interested === 'true';

    const totalCount = await Product.countDocuments({ user: req.userId });

    // Build aggregation pipeline for stats
    let statsMatch: any = { user: req.userId, bought: true };

    // Add year filter if specified
    if (year && typeof year === 'string') {
      const yearNum = parseInt(year, 10);
      statsMatch.dateOfPurchase = {
        $gte: new Date(yearNum, 0, 1),
        $lt: new Date(yearNum + 1, 0, 1)
      };
    }

    const stats = await Product.aggregate([
      { $match: statsMatch },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: { $ifNull: ["$price", 0] } },
          totalLiked: { $sum: { $cond: [{ $eq: ["$liked", true] }, 1, 0] } },
          totalItems: { $sum: { $ifNull: ["$quantityBought", 1] } }
        }
      }
    ]);

    const { totalSpent = 0, totalLiked = 0, totalItems = 0 } = stats[0] || {};

    // Get yearly spending breakdown
    const yearlyStats = await Product.aggregate([
      { $match: { user: req.userId, bought: true, dateOfPurchase: { $exists: true } } },
      {
        $group: {
          _id: { $year: "$dateOfPurchase" },
          spent: { $sum: { $ifNull: ["$price", 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    if (limit && parseInt(limit as string, 10) === 0) {
      res.status(200).json({ products: [], totalCount, totalSpent, totalLiked, totalItems, yearlyStats });
      return;
    }

    let sortOptions: any = {};
    if (typeof sortBy === 'string') {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);

    res.json({ products, totalCount, totalSpent, totalLiked, totalItems, yearlyStats });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      res.json([]);
      return;
    }

    const regex = new RegExp(query, 'i');
    const userFilter = { user: req.userId };

    const nameSuggestions = await Product.find({ ...userFilter, name: regex }).limit(5).distinct('name');
    const grapeSuggestions = await Product.find({ ...userFilter, grapeType: regex }).limit(5).distinct('grapeType');
    const tagSuggestions = await Product.find({ ...userFilter, tags: regex }).limit(5).distinct('tags');

    const allSuggestions = [...nameSuggestions, ...grapeSuggestions, ...tagSuggestions];
    const combined = [...new Set(allSuggestions)];

    res.json(combined.slice(0, 10));
  } catch (error) {
    next(error);
  }
};

export const getGrapeTypes: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const grapeTypes = await Product.distinct('grapeType', { user: req.userId });
    // Flatten and deduplicate since grapeType is an array
    const uniqueGrapes = [...new Set(grapeTypes.flat())].filter(Boolean).sort();
    res.json(uniqueGrapes);
  } catch (error) {
    next(error);
  }
};

export const updateProduct: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Conflict: Product with this name already exists.', field: 'name' });
    } else {
      next(error);
    }
  }
};

export const deleteProduct: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findOneAndDelete({ _id: id, user: req.userId });

    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};