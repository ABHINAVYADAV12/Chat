const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const { User } = require("./models/userModel");

const createWebSocketServer = (server) => {
  const wss = new ws.WebSocketServer({ server });

  wss.on("connection", (connection, req) => {
    connection.isAlive = true;

    // Heartbeat ping to detect dead clients
    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlinePeople();
        console.log("dead");
      }, 1000);
    }, 5000);

    connection.on("pong", () => {
      clearTimeout(connection.deathTimer);
    });

    // Handle JWT from cookies
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenString = cookies.split(";").find((str) => str.trim().startsWith("authToken="));
      if (tokenString) {
        const token = tokenString.split("=")[1];
        jwt.verify(token, process.env.JWTPRIVATEKEY, {}, async (err, userData) => {
          if (err) {
            console.log("JWT error:", err);
            return;
          }
          const { _id, firstName, lastName } = userData;
          connection.userId = _id;
          connection.username = `${firstName} ${lastName}`;
          await notifyAboutOnlinePeople();
        });
      }
    }

    // Incoming message
    connection.on("message", async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text } = messageData;

      if (!recipient || !text) return;

      const msgDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients].forEach((client) => {
        if (client.userId === recipient) {
          client.send(
            JSON.stringify({
              sender: connection.username,
              text,
              id: msgDoc._id,
            })
          );
        }
      });
    });

    // Notify everyone about online users
    const notifyAboutOnlinePeople = async () => {
      const onlineUsers = await Promise.all(
        Array.from(wss.clients).map(async (client) => {
          const { userId, username } = client;
          if (!userId) return null;

          const user = await User.findById(userId);
          const avatarLink = user ? user.avatarLink : null;

          return {
            userId,
            username,
            avatarLink,
          };
        })
      );

      const filteredOnlineUsers = onlineUsers.filter(Boolean);

      [...wss.clients].forEach((client) => {
        client.send(
          JSON.stringify({
            online: filteredOnlineUsers,
          })
        );
      });

      console.log("Online Users:", filteredOnlineUsers);
    };
  });
};

module.exports = createWebSocketServer;
