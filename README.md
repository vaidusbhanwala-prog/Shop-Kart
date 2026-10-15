# Shop-Kart 🛒

**Shop-Kart** is a full-stack e-commerce web application that allows customers to browse products, manage their shopping carts and wishlists, authenticate securely, and place orders through an online shopping experience.

The project is built with React on the frontend and Node.js, Express, and MongoDB on the backend.

## ✨ Features

- **User Authentication** — Customer registration, login, logout, and password changes.
- **Product Catalog** — Browse products and view individual product details.
- **Shopping Cart** — Add products, update quantities, and remove items.
- **Wishlist** — Save favorite products and manage wishlist items.
- **Order Management** — Create payment orders, verify payments, and view order history.
- **Protected Routes** — Restrict customer-specific operations to authenticated users.
- **REST API** — A modular backend organized into routes, controllers, models, and middleware.
- **Responsive Interface** — A shopping experience designed for modern web browsers.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- cookie-parser
- CORS

### Deployment
- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MongoDB

## 📁 Project Structure

```text
Shop-Kart/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── ...
│
└── README.md
```

*The structure above is representative; adjust it to match the actual repository.*

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB, either locally or through MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Shop-Kart
```

Replace the placeholder with your repository URL.

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopkart_db
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Update `MONGO_URI` if you are using MongoDB Atlas.

**Security:** Use a strong, randomly generated `JWT_SECRET`. Never commit your `.env` file or expose production credentials.

Start the backend using the script defined in your `backend/package.json`. If your start script is configured as `start`, run:

```bash
npm start
```

The API should be available at `http://localhost:5000`.

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### 4. Configure production deployment

For the deployed frontend, configure this environment variable in Netlify:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-BACKEND-URL
```

For the backend, configure the appropriate production environment variables in Render, including:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL=https://shop-kart-pro.netlify.app`
- `NODE_ENV=production`

Use your actual deployed backend URL and frontend domain. Do not include a trailing slash in the API base URL.

The backend must allow credentialed requests from the frontend, and authentication cookies must use appropriate secure settings for HTTPS.

## 🔌 API Endpoints

The following endpoints are based on the application's route structure. Authentication requirements and request payloads depend on the individual route handlers.

### Customer Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/register` | Register a customer |
| POST | `/customers/login` | Log in |
| GET | `/customers/me` | Get the authenticated customer's profile |
| POST | `/customers/logout` | Log out |
| PATCH | `/customers/change-password` | Change password |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Retrieve products |
| GET | `/products/:id` | Retrieve a product by ID |
| POST | `/products` | Create a product |

### Wishlist

| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Retrieve the wishlist |
| POST | `/wishlist/:productId` | Add a product |
| DELETE | `/wishlist/:productId` | Remove a product |
| PATCH | `/wishlist/:productId/toggle` | Toggle wishlist membership |

### Shopping Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Retrieve the cart |
| POST | `/cart/:productId` | Add a product |
| PATCH | `/cart/:productId` | Update quantity |
| DELETE | `/cart/:productId` | Remove a product |

### Orders and Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/create-payment-order` | Create a payment order |
| POST | `/orders/verify-payment` | Verify payment details |
| GET | `/orders` | Retrieve customer orders |
| GET | `/orders/:id` | Retrieve an order by ID |
| PATCH | `/orders/:id/status` | Update order status |

**Note:** Verify the exact HTTP methods, authorization rules, and payment provider requirements against the implementation before relying on this API reference.

## 🔐 Authentication and Security

- Passwords are hashed using `bcryptjs`.
- JWTs are used to authenticate customers.
- Authentication tokens are stored in HTTP-only cookies.
- Credentialed cross-origin requests are supported.
- Customer-specific endpoints should derive the authenticated identity from the verified token rather than trusting a client-supplied user ID.
- Production secrets must be stored in deployment environment variables.

## 🧪 Testing

Before considering a deployment complete, verify:

- Customer registration and login.
- Access to the authenticated customer profile.
- Logout and session expiration.
- Product listing and product details.
- Cart and wishlist operations.
- Order creation and payment verification.
- Unauthorized requests to protected endpoints.
- Frontend-to-backend communication in production.

## 🌐 Live Application

- **Frontend:** https://shop-kart-pro.netlify.app
- **Backend:** https://shop-kart-38qy.onrender.com

## 🔮 Future Improvements

- Product search, filtering, and sorting.
- Product categories and pagination.
- Admin dashboard and role-based authorization.
- Product reviews and ratings.
- Order tracking and cancellation.
- Automated tests and CI/CD.
- Improved logging, monitoring, and API documentation.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Submit a pull request with a clear description.

## 📄 License

Add a license before distributing or accepting contributions. If you have not selected one, the project currently has no explicitly declared open-source license.

---

Built as a full-stack e-commerce project to practice frontend development, REST API design, authentication, database integration, and deployment.
