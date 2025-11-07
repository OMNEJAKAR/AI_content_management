import User from "../models/User.js";
import bcrypt from "bcrypt";

export async function ensureAdminExists() {
  const adminUser = await User.findOne({ username: "admin" });
  if (adminUser) {
    console.log("Admin already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash("admin4", 10);
  const user = new User({ username: "admin", passwordHash, role: "admin" });
  await user.save();
  console.log("Admin user created: username=admin password=admin4");
}
