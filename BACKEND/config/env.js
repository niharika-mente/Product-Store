const requiredEnvVars = [
  {
    key: "MONGO_URI",
    validate: (v) => v.startsWith("mongodb"),
    message: "must be a valid MongoDB connection string",
  },
  {
    key: "PORT",
    validate: (v) => !isNaN(Number(v)),
    message: "must be a number",
  },
  {
    key: "NODE_ENV",
    validate: (v) => ["development", "production", "test"].includes(v),
    message: 'should be "development", "production", or "test"',
  },
  {
    key: "VITE_API_URL",
    validate: (v) => v.startsWith("http"),
    message: "must be a valid URL",
  },
  {
    key: "JWT_SECRET",
    validate: (v) => v.length >= 32,
    message: "must be at least 32 characters long",
  },
];

export const validateEnv = () => {
  let hasError = false;

  requiredEnvVars.forEach(({ key, validate, message }) => {
    const value = process.env[key];
    if (!value) {
      console.error(`❌ Missing env variable: ${key}`);
      hasError = true;
    } else if (!validate(value)) {
      console.error(`❌ Invalid env variable: ${key} — ${message}`);
      hasError = true;
    } else {
      console.log(`✅ ${key} is valid`);
    }
  });

  if (hasError) {
    console.error("\n🚨 Server startup aborted due to missing/invalid env variables.");
    process.exit(1);
  }

  console.log("\n🚀 All environment variables validated successfully!\n");
};