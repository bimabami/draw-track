import 'dotenv/config';

import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/auth.route.js';
import teamRoutes from './routes/team.route.js';
import topicRoutes from './routes/topic.route.js';
import taskRoutes from './routes/task.route.js';
import documentRoutes from './routes/document.route.js';
import commentRoutes from './routes/comment.route.js';
import notificationRoutes from './routes/notification.route.js';

import { errorHandler } from './middlewares/errorHandler.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;

const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"]
  }
});

// Export io for use in services
export { io };

app.set("io", io);

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow files to be downloaded from frontend
}));
app.use(morgan('dev'));
app.use(json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to the Engineering Management Backend API');
});

app.use("/api", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teams", teamRoutes, topicRoutes, taskRoutes, documentRoutes, commentRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join user-specific room for notifications
  socket.on("join-user", (userId) => {
    console.log(`user joined room: user:${userId}`);
    socket.join(`user:${userId}`);
  });

  // Join team room for team-specific updates
  socket.on("join-team", (teamId) => {
    console.log(`user joined room: team:${teamId}`);
    socket.join(`team:${teamId}`);
  });

  socket.on("join-task", (taskId) => {
    console.log(`user joined room: task:${taskId}`);
    socket.join(`task:${taskId}`);
  });

  socket.on("comment:new", (data) => {
    console.log("New comment received:", data);
    io.to(`task:${data.taskId}`).emit("comment:new", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(
  (err, req, res, next) => {
    errorHandler(err, req, res, next);
  }
);

server.listen(PORT, () => console.log(`🚀 Server and Socket.IO running at http://localhost:${PORT}`));

export default app;