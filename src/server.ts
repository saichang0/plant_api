import "reflect-metadata";
import "dotenv/config";
import os from "os"; 
import { AppDataSource } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        if (!iface.address.startsWith("192.168.198") && !iface.address.startsWith("192.168.240")) {
          return iface.address;
        }
      }
    }
  }
  return "localhost";
}

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to PostgreSQL database successfully!");

    const { app } = await createApp();

    const localIP = getLocalIP();

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log("🚀 Server running on:");
      console.log(`   - Local:   http://localhost:${PORT}/graphql`);
      console.log(`   - Network: http://${localIP}:${PORT}/graphql`);
      console.log(`   - Android Emulator: http://10.0.2.2:${PORT}/graphql`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);  
    process.exit(1);
  }
}

startServer();
