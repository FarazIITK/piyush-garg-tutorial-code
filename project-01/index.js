const express = require("express");
const fs = require("fs");

const PORT = 8000;
const usersFilePath = "./usersData.json";
const logFilePath = "./apiLogs.json";

const app = express();

app.use(express.json());

// Always append "X" to custom headers
// Ex: "X-Powered-By"
// 1. Access rrequest headers --> req.headers()
// 2. Add header to response --> res.setHeader("key", value);

// Health API
app.get("/api/health", (req, res) => {
  res.json("All good! Do not worry");
});

app.use((req, res, next) => {
  fs.readFile(logFilePath, "utf-8", (err, data) => {
    const prevLogs = JSON.parse(data);

    const newLog = {
      date: new Date(),
      method: req.method,
      url: req.url,
    };

    const updatedLogs = [...prevLogs, newLog];

    const updatedLogsJson = JSON.stringify(updatedLogs, null, 2);

    fs.writeFile(logFilePath, updatedLogsJson, (err, data) => {
      next();
    });
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
  return res.json(users);
});

// Create user
app.post("/api/user", (req, res) => {
  const { name } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

  const newUser = {
    id: users.length + 1,
    name,
  };

  users.push(newUser);

  const updatedFileData = JSON.stringify(users, null, 2);

  fs.writeFileSync(usersFilePath, updatedFileData);

  return res.json(`Successfully created user with id equal to ${users.length}`);
});

// Update user
app
  .route("/api/user/:id")
  .get((req, res) => {
    const { id } = req.params;
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    const result = users.find((user) => user.id === parseInt(id));

    if (result) {
      return res.json(result);
    }

    return res.json(`User with id equal to ${id} doesn't exist`);
  })
  .patch((req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    const targetUserIndex = users.findIndex((user) => user.id === parseInt(id));

    console.log(targetUserIndex);

    if (targetUserIndex >= 0) {
      const updatedUser = {
        id: users[targetUserIndex].id,
        name,
      };
      users[targetUserIndex] = updatedUser;

      const updatedFileData = JSON.stringify(users, null, 2);
      fs.writeFileSync(usersFilePath, updatedFileData);
      return res.json(`Successfully updated user with id equal to ${id}`);
    }

    return res.json(`User with id equal to ${id} doesn't exist`);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    const updatedUsers = users.filter((user) => user.id !== parseInt(id));

    if (updatedUsers.length === users.length - 1) {
      const updatedFileData = JSON.stringify(updatedUsers, null, 2);
      fs.writeFileSync(usersFilePath, updatedFileData);
      return res.json(`Successfully deleted user with id equal to ${id}`);
    }

    return res.json(`User with id equal to ${id} doesn't exist`);
  });

// Delete User

app.listen(PORT, () => {
  console.log(`Server listerning to PORT ${PORT}`);
});
