const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const User = require("./models/UserModel");
const Message = require("./models/MessageModel");

dotenv.config();
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.clientURL,
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, process.env.jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);

  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });

  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });

  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        process.env.jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(200)
            .json({ _id: foundUser._id });
        }
      );
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });

    jwt.sign(
      { userId: createdUser._id, username },
      process.env.jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ _id: createdUser._id });
      }
    );
  } catch (err) {
    if (err) throw err;
  }
});

const server = app.listen(process.env.PORT, () => {});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();

    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      console.log("death");
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token"));

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];

      if (token) {
        jwt.verify(token, process.env.jwtSecret, {}, (err, userData) => {
          if (err) throw err;

          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  // save message to db
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;

    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      // filter users to send only to its recipient
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              sender: connection.userId,
              recipient,
              text,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});
