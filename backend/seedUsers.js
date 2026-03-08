import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js"; 

dotenv.config();

const usersToAdd = [
  {
    name: "Admin User",
    email: "admin@example.com",
    passwordHash: "123456",
    role: "admin",
  },
  {
    name: "Member Test",
    email: "member@example.com",
    passwordHash: "123456",
    role: "member",
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.insertMany(usersToAdd);
    console.log("✅ Users Added Successfully!");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error adding users:", err);
    mongoose.connection.close();
  }
}

seedUsers();
