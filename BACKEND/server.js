//const express = require('express');

// Import the app configured in app.js and start the server
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
   console.log("\n🚀 ================================");
   console.log(`   Server started at http://localhost:${PORT}`);
   console.log("   ================================\n");
});
