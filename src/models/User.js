const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain text — intentionally insecure
    email: { type: String, required: true },
    role: { type: String, default: "user" },
    secret: { type: String, default: "nothing here" }, // used for IDOR demo
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
