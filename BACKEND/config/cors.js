import cors from 'cors';

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("CORS Policy Error: Origin not allowed"));
  },
  credentials: true
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;