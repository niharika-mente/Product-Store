A fully responsive, production-ready Full-Stack Product Management application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled with **Chakra UI**. This project features a modular architecture, seamless CRUD capabilities via a robust REST API, and is configured for modern serverless deployment.
## 🚀 Features

- **Full CRUD Capabilities:** Add, view, update, and delete products seamlessly from a central dashboard.
- **Dynamic State Management:** Real-time frontend updates when modifying product catalogs without manual page reloads.
- **Modern Responsive UI:** Clean, accessible user interface optimized for desktop, tablet, and mobile viewing screens using Chakra UI.
- **Robust REST API:** Fully structured backend routing handling server status codes, requests payload handling, and asynchronous data flows.
- **Global Theme Support:** Native dark/light mode toggle integrated for custom client accessibility preferences.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Chakra UI, Axios, React Icons
- **Backend:** Node.js, Express.js framework
- **Database:** MongoDB (with Mongoose Object Modeling)
- **Deployment & Config:** Optimized configuration for Vercel Serverless Functions and `dotenv` environment encapsulation.

---

## 📁 Repository Structure

```text
Product-Store/
├── BACKEND/             # Express.js REST API, Database controllers & schemas
├── FRONTEND/            # React.js SPA built with global UI components
├── package.json         # Root scripts configured for deployment/monorepo build
├── README.md            # Project documentation
├── .env.example         # Environment variables template
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** (comes with Node.js)
- **MongoDB** — either a [local instance](https://www.mongodb.com/docs/manual/installation/) or a [free Atlas cluster](https://www.mongodb.com/cloud/atlas)

## 🚀 Local Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/niharika-mente/Product-Store.git
cd Product-Store
```

### 2. Install Dependencies

Install dependencies for the root project, backend, and frontend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd BACKEND && npm install && cd ..

# Install frontend dependencies
cd FRONTEND && npm install && cd ..
```

### 3. Environment Variables

Create environment files for both the root project and the backend:

```bash
# Root environment
cp .env.example .env

# Backend environment
cp BACKEND/.env.example BACKEND/.env
```

Edit the files with your own values.

#### Root `.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

#### Backend `.env`

The backend requires additional environment variables such as:

```env
JWT_SECRET=your-jwt-secret-change-in-production
```

Additional variables for Stripe, Cloudinary, OAuth providers, rate limiting, and Elasticsearch are documented in:

```text
BACKEND/.env.example
```

> **Note:** The backend requires additional environment variables (including `JWT_SECRET`) that are defined in `BACKEND/.env.example`. Refer to that file for the complete backend configuration. `MONGO_URI` can be obtained from MongoDB Atlas or a local MongoDB instance.

### 4. Start the Application

Run the **backend server** (with auto-reload via nodemon):

# Start the application
npm run start


## Docker Setup

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

### Run with Docker

```bash
docker-compose up --build
```

### Services

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |
| MongoDB  | localhost:27017       |

### Stop Services

```bash
docker-compose down
```

```bash
npm run dev
```

In a **separate terminal**, start the **frontend dev server**:

```bash
cd FRONTEND && npm run dev
```

- The backend API runs at `http://localhost:5000`
- The frontend app runs at `http://localhost:5173`

---

## 🚀 Continuous Deployment (CI/CD)

This repository is configured with an environment-aware CI/CD pipeline using GitHub Actions and Vercel.

### Deployment Environments

- **Staging**: Merges/pushes to the `develop` branch automatically deploy to Vercel's preview environment targeting the `staging` GitHub Environment.
- **Production**: Merges/pushes to the `main` branch automatically deploy to Vercel's production environment targeting the `production` GitHub Environment.

Production deployments are strictly isolated and cannot be triggered from the `develop` branch.

### Prerequisites & GitHub Configuration

To enable deployment integration, configure the following:

#### 1. GitHub Environments
Create two environments in your GitHub repository (**Settings > Environments**):
- `staging`
- `production`

#### 2. GitHub Secrets
Add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):
- `VERCEL_TOKEN`: Your Vercel Personal Access Token.
- `VERCEL_ORG_ID`: Your Vercel Organization or Team ID.
- `VERCEL_PROJECT_ID`: Your Vercel Project ID. Note that this can also be set or overridden per GitHub Environment if you deploy to separate Vercel projects.

---

## 💖 Contributors

Thanks to all the amazing people who contribute to **Product Store** 🚀

<p align="center">
  <a href="https://github.com/niharika-mente/Product-Store/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=niharika-mente/Product-Store" alt="Contributors"/>
  </a>
</p>


## ⭐ Project Support

<p align="center">
  <a href="https://github.com/niharika-mente/Product-Store/stargazers">
    <img src="https://img.shields.io/github/stars/niharika-mente/Product-Store?style=social" alt="Stars">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/niharika-mente/Product-Store/network/members">
    <img src="https://img.shields.io/github/forks/niharika-mente/Product-Store?style=social" alt="Forks">
  </a>
</p>
