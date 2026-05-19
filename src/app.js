const express=require("express");
const cors=require("cors");
const http=require("http");
const { Server }=require("socket.io");
require("dotenv").config();
const authRoutes=require("./routes/auth");
const taskRoutes=require("./routes/tasks");
const { verifyToken }=require("./middleware/authMiddleware");
const app=express();
const server=http.createServer(app);
const io=new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", verifyToken, taskRoutes);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
const PORT=process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));