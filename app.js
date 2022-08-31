require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const Airtable = require("airtable");
const { v4: uuidv4 } = require("uuid");

const base = new Airtable({ apiKey: process.env.AIR_TABLE_API_KEY }).base(
  process.env.AIR_TABLE_BASE
);

const app = express();

app.use(express.json());

const posts = [
  {
    username: "Ovesh",
    title: "post 1",
  },
  {
    username: "Mohammad",
    title: "post 2",
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/register", (req, res) => {
  userDetails = {};

  const authToken = jwt.sign(userDetails, process.env.ACCESS_TOKEN_SECRET);
  res.json({
    success: true,
    authToken: authToken,
  });
});

app.post("/user", authenticateToken, async (req, res) => {
  try {
    const userID = uuidv4();
    await base("users").create([
      {
        fields: {
          userID: userID,
          name: req.body.name,
          email: req.body.email,
          mobileNumber: req.body.mobileNumber[0],
          mobileNumber2:
            req.body.mobileNumber.length > 1 ? req.body.mobileNumber[1] : null,
        },
      },
    ]);

    res.json({
      success: true,
      userID: userID,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user", authenticateToken, async (req, res) => {
  try {
    const users = await base("users")
      .select({
        view: "users",
      })
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          return;
        }

        const retrivedData = records.map((data) => data.fields);

        res.json({
          success: true,
          retrivedData,
        });
      });
  } catch (err) {
    console.log(err);
  }
});

app.listen(5000, console.log("Server Running on port 5000"));
