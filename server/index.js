import express from "express";
import mysql from "mysql";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST, GET"],
    credentials: true,
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_stiegeyms",
});

//authentication of the account logged in
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Message: "Is not Authenticated" });
  } else {
    jwt.verify(token, "our-jsonwebtoken-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ Message: "Authentication Error." });
      } else {
        req.UUID = decoded.UUID;
        req.USERNAME = decoded.USERNAME;
        req.USER_TYPE = decoded.USER_TYPE;
        req.AUTH = decoded.AUTH;
        next();
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  return res.json({
    Status: "Success",
    UUID: req.UUID,
    USERNAME: req.USERNAME,
    USER_TYPE: req.USER_TYPE,
    AUTH: req.AUTH,
  });
});

app.post("/login", (req, res) => {
  const sql =
    "SELECT * FROM user INNER JOIN permission ON user.UUID = permission.UUID WHERE Username = ? AND Password = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) return res.json({ Message: "Server Sided Error" });
    if (data.length > 0) {
      const UUID = data[0].UUID;
      const USERNAME = data[0].Username;
      const USER_TYPE = data[0].USER_TYPE;

      const AUTH = data[0].AUTH;

      const token = jwt.sign(
        {
          UUID,
          USERNAME,
          USER_TYPE,
          AUTH,
        },
        "our-jsonwebtoken-secret-key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ Status: "Success" });
    } else {
      return res.json({ Message: "No Records Found" });
    }
  });
});

//de-authentication of the account that was logged in
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

//checks of the server is running
app.listen(8081, () => {
  console.log("Running");
});

app.get("/status", (req, res) => {
  res.send("server is running");
});

app.use("/css", express.static("./node_modules/bootstrap/dist/css"));
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));

/* ==============================================
    This section pertains to CRUD Operations:
        1. CREATE
        2. READ
        3. UPDATE
        4. DELETE
===============================================*/

/*
    Entity Name: Coach
*/
app.post("/coach-selection", (req, res) => {
  const sql = "SELECT * FROM tbl_coach WHERE Deleted='False'";

  db.query(sql, (err, data) => {
    if (err) return res.json({ Message: "Server Sided Error" });
    return res.json(data);
  });
});
