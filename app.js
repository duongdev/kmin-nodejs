const mongodb = require("mongodb");
const express = require("express");

const app = express();

const MongoClient = mongodb.MongoClient;

const config = {
  uri: "mongodb://localhost:27017",
  db: "kmin-todo-list",
  collection: "tasks",
  serverPort: 4000,
};

// Database
// Table = Collection
// Row = Document

MongoClient.connect(config.uri, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    console.log(`couldn't connect to MongoDB`, error);
    return;
  }

  console.log(`connected to MongoDB successfully.`);

  const db = client.db(config.db);

  app.post("/task", (req, res) => {
    const taskContent = req.query.content;

    const task = {
      content: taskContent,
      done: false,
      createdAt: new Date(),
    };

    db.collection(config.collection)
      .insertOne(task)
      .then((result, error) => {
        if (error) {
          res.status(500).send(error);
          return;
        }

        res.json(result.ops[0]);
      });
  });

  app.get("/tasks", (req, res) => {
    db.collection(config.collection)
      .find()
      .sort({ _id: -1 })
      .toArray()
      .then((tasks) => res.json(tasks));
  });

  app.listen(config.serverPort, () => {
    console.log(`Web server is running on port ${config.serverPort}`);
  });
});
