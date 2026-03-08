import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js"; 

dotenv.config();

async function deleteUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // ❌ امسح كل المستخدمين:
    // await User.deleteMany({});

    

    // ❌ امسح فقط الأعضاء Member:
    // await User.deleteMany({ role: "member" });



    // ❌ امسح فقط الأعضاء Member: معدا مستخدم معين 
        await User.deleteMany({
        role: "member",
        email: { $nin: ["karimkarim20555@gmail.com", "user@gmail.com"] }
        });


    // await User.deleteMany({
    //   role: "member",
    //   _id: { $ne: "6728d43d973cbbf9c01e3c55" }
    // });



    // ❌ امسح مستخدم واحد بالإيميل:
    // await User.deleteOne({ email: "member@example.com" });

    console.log("🗑️ Users Deleted Successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error deleting users:", err);
    mongoose.connection.close();
  }
}

deleteUsers();
