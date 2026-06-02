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

Install dependencies for the **backend** (root) and **frontend** separately:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd FRONTEND && npm install && cd ..
```

### 3. Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

> **Note:** `MONGO_URI` is required. You can get one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or use `mongodb://localhost:27017/productstore` for a local MongoDB instance.

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
