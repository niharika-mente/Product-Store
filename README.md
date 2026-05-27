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
└── README.md            # Project documentation
⚙️ Local Installation & Setup
Follow these steps to run the application on your local machine:

1. Clone the Repository
Bash
git clone [https://github.com/niharika-mente/Product-Store.git](https://github.com/niharika-mente/Product-Store.git)
cd Product-Store
2. Environment Configuration
Create a .env file in the root directory (or inside your backend module directory depending on your local config) and include your connection strings:

Code snippet
MONGO_URI=your_mongodb_connection_string
PORT=5000
3. Install Dependencies
Install dependencies across both your backend and frontend structures:

Bash
# Install root/backend dependencies
npm install

# Navigate to frontend and install dependencies
cd FRONTEND
npm install
cd ..
4. Build and Run the Application
You can use the configured root-level commands to build and run the production or development environments:

Bash
# Build the application
npm run build

# Start the application
npm run start
