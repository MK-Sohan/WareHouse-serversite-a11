const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iewxe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("fruitemanagement");
    const fruitCollection = database.collection("fruites");
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const details = await fruitCollection.findOne(query);
      res.send(details);
    });

    // Post
    app.post("/inventory", async (req, res) => {
      const newaddFruit = req.body;
      const result = await fruitCollection.insertOne(newaddFruit);
      console.log(result);
      res.send(result);
    });

    // Delete
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
    });

    // Put
    app.put("/deliver/:id", async (req, res) => {
      const id = req.params.id;
      const newQuantity = req.body;
      console.log(newQuantity);
      const deliver = newQuantity.quantity - 1;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: deliver,
        },
      };

      const result = await fruitCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // update
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateProduct.newQuantity,
        },
      };

      const result = await fruitCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
    // Jwt
    app.post("/login", (req, res) => {
      const email = req.body;
      console.log(email);
      const accesstoken = jwt.sign(email, process.env.ACCESS_TOKEN, {
        expiresIn: "100m",
      });
      res.send({ accesstoken });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
