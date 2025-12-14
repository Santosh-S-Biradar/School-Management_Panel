import bcrypt from "bcryptjs";
import db from "./src/config/db.js";

const createAdmin = async () => {
  const name = "Admin";
  const email = "admin@school.com";
  const password = "admin123"; 
  const role = "admin";

  const hashed = bcrypt.hashSync(password, 10);

  try {
    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role]
    );
    console.log("✅ Admin Created Successfully!");
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
  process.exit();
};

createAdmin();
