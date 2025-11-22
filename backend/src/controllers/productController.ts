import express from 'express';
import Product from '../models/Product';

export const addProduct: express.RequestHandler = async (req, res, next) => {
  try {
    const { name, description, price, liked, bought, type, country, wineType, grapeType, alcoholPercent, url, tags, picture } = req.body;
    const newProduct = new Product({ name, description, price, liked, bought, type, country, wineType, grapeType, alcoholPercent, url, tags, picture });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      res.status(409).json({ message: 'Conflict: Product with this name already exists.', field: 'name' });
    } else {
        next(error);
    }
  }
};

export const getProducts: express.RequestHandler = async (req, res, next) => {
  try {
    const { search, type, country, wineType, fav, purchased, tags, sortBy, order = 'asc', limit, year } = req.query;

    const query: any = {};

    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { grapeType: regex },
        { tags: regex },
      ];
    }
    
    if (type) {
      query.type = type;
    }
    if (country) {
      query.country = country;
    }
    if (wineType) {
      query.wineType = wineType;
    }
    if (tags) {
      query.tags = { $in: [tags] };
    }
    if (fav !== undefined) {
      query.liked = fav === 'true';
    }
    if (purchased !== undefined) {
      query.bought = purchased === 'true';
    }
    
    const totalCount = await Product.countDocuments();
    
    // Build aggregation pipeline for stats
    const statsQuery: any = {};
    let statsMatch: any = { bought: true };
    
    // Add year filter if specified
    if (year && typeof year === 'string') {
      const yearNum = parseInt(year, 10);
      statsMatch.dateOfPurchase = {
        $gte: new Date(yearNum, 0, 1), // January 1st of the year
        $lt: new Date(yearNum + 1, 0, 1) // January 1st of next year
      };
    }

    const stats = await Product.aggregate([
      { $match: statsMatch },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: { $ifNull: ["$price", 0] } },
          totalLiked: { $sum: { $cond: [{ $eq: ["$liked", true] }, 1, 0] } }
        }
      }
    ]);
    
    const { totalSpent = 0, totalLiked = 0 } = stats[0] || {};
    
    if (limit && parseInt(limit as string, 10) === 0) {
      res.status(200).json({ products: [], totalCount, totalSpent, totalLiked });
      return;
    }

    let sortOptions: any = {};
    if (typeof sortBy === 'string') {
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions = { createdAt: -1 };
    }
    
    const products = await Product.find(query).sort(sortOptions);

    res.json({ products, totalCount, totalSpent, totalLiked });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions: express.RequestHandler = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      res.json([]);
      return;
    }

    const regex = new RegExp(query, 'i');

    const nameSuggestions = await Product.find({ name: regex }).limit(5).distinct('name');
    const grapeSuggestions = await Product.find({ grapeType: regex }).limit(5).distinct('grapeType');
    const tagSuggestions = await Product.find({ tags: regex }).limit(5).distinct('tags');

    const allSuggestions = [...nameSuggestions, ...grapeSuggestions, ...tagSuggestions];
    const combined = [...new Set(allSuggestions)];

    res.json(combined.slice(0, 10));
  } catch (error) {
    next(error);
  }
};

export const updateProduct: express.RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      res.status(409).json({ message: 'Conflict: Product with this name already exists.', field: 'name' });
    } else {
      next(error);
    }
  }
};