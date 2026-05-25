require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Homepage
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Vulnerability routes (we add these one by one each phase)
app.use("/injection", require("./routes/injection"));
app.use("/xss", require("./routes/xss"));
app.use("/auth", require("./routes/auth"));
app.use("/idor", require("./routes/idor"));
app.use("/misconfig", require("./routes/misconfig"));
app.use("/exposure", require("./routes/exposure"));

app.listen(PORT, () => {
  console.log(`Lab running at http://localhost:${PORT}`);
});
