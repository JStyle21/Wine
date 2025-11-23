import express from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createOrder: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { orderNumber, orderDate, items, notes, status } = req.body;

    // Calculate total price from items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, user: req.userId });
      if (!product) {
        res.status(404).json({ message: `Product not found: ${item.productId}` });
        return;
      }

      const priceAtOrder = product.price || 0;
      const quantity = item.quantity || 1;
      totalPrice += priceAtOrder * quantity;

      orderItems.push({
        product: product._id,
        quantity,
        priceAtOrder
      });
    }

    const newOrder = new Order({
      orderNumber,
      orderDate: orderDate || new Date(),
      items: orderItems,
      totalPrice,
      status: status || 'pending',
      notes,
      user: req.userId
    });

    await newOrder.save();

    // Populate product details for response
    await newOrder.populate('items.product', 'name type price picture');

    res.status(201).json(newOrder);
  } catch (error: any) {
    next(error);
  }
};

export const getOrders: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { status, sortBy = 'orderDate', order = 'desc' } = req.query;

    const query: any = { user: req.userId };

    if (status) {
      query.status = status;
    }

    let sortOptions: any = {};
    if (typeof sortBy === 'string') {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    const orders = await Order.find(query)
      .sort(sortOptions)
      .populate('items.product', 'name type price picture country wineType');

    // Calculate stats
    const totalOrders = await Order.countDocuments({ user: req.userId });
    const pendingOrders = await Order.countDocuments({ user: req.userId, status: 'pending' });
    const collectedOrders = await Order.countDocuments({ user: req.userId, status: 'collected' });

    const totalSpentAgg = await Order.aggregate([
      { $match: { user: req.userId } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalSpent = totalSpentAgg[0]?.total || 0;

    res.json({
      orders,
      stats: {
        totalOrders,
        pendingOrders,
        collectedOrders,
        totalSpent
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: req.userId })
      .populate('items.product', 'name type price picture country wineType');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrder: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { orderNumber, orderDate, items, notes, status } = req.body;

    const order = await Order.findOne({ _id: id, user: req.userId });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // If items are being updated, recalculate
    if (items) {
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, user: req.userId });
        if (!product) {
          res.status(404).json({ message: `Product not found: ${item.productId}` });
          return;
        }

        const priceAtOrder = product.price || 0;
        const quantity = item.quantity || 1;
        totalPrice += priceAtOrder * quantity;

        orderItems.push({
          product: product._id,
          quantity,
          priceAtOrder
        });
      }

      order.items = orderItems;
      order.totalPrice = totalPrice;
    }

    if (orderNumber !== undefined) order.orderNumber = orderNumber;
    if (orderDate !== undefined) order.orderDate = orderDate;
    if (notes !== undefined) order.notes = notes;
    if (status !== undefined) order.status = status;

    await order.save();
    await order.populate('items.product', 'name type price picture');

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder: express.RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findOneAndDelete({ _id: id, user: req.userId });

    if (!deletedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
