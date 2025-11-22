# Wine & Spirit Collection Tracker

A full-stack application for tracking your alcohol purchases, including wines and spirits.

## Features

- **Purchase Tracking**: Price, date, product links, pickup range (by month)
- **Wine-Specific Fields**: Grape type, wine type, kosher indicator, country of origin
- **Inventory Management**: Track quantity bought and quantity remaining
- **Statistics**: Total spent, spending by year
- **Organization**: Mark items as liked, bought, reviewed, or interested
- **Authentication**: Secure login with encrypted passwords (bcrypt)

## Prerequisites

- Docker and Docker Compose

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Wine
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api
   - MongoDB: localhost:27018 (for external tools like MongoDB Compass)

4. **Create an account** and start tracking your collection!

## Configuration

### Environment Variables

The following environment variables can be configured in `docker-compose.yml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongodb:27017/wineApp` |
| `JWT_SECRET` | Secret key for JWT tokens | Change in production! |

### Changing Ports

- **Frontend**: Change `"3000:80"` in docker-compose.yml
- **Backend**: Change `"5001:5001"` and `PORT` environment variable
- **MongoDB**: Change `"27018:27017"` (first number is host port)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/suggestions` - Get autocomplete suggestions

### Query Parameters for GET /api/products
- `search` - Search by name
- `type` - Filter by type (wine/spirit)
- `country` - Filter by country
- `bought` - Filter by bought status
- `liked` - Filter by liked status
- `reviewed` - Filter by reviewed status
- `interested` - Filter by interested status

## Development

### Running without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

Requires MongoDB running locally on port 27017.

### Tech Stack

- **Frontend**: React, CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt (12 rounds)
- **Containerization**: Docker, Docker Compose

## Security Notes

- Change `JWT_SECRET` in production
- Passwords are hashed with bcrypt (12 salt rounds)
- All product routes require authentication
- User data is isolated (users only see their own products)

## Stopping the Application

```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```
