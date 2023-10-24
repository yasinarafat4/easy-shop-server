const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Database
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qx5eerd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();

    // Collections
    const productsCollection = client.db("EasyShopDB").collection("products");
    const popularCollection = client.db("EasyShopDB").collection("popular");
    const cartCollection = client.db("EasyShopDB").collection("carts");

    // Getting all products data
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // Getting products category
    app.get("/products/:category", async (req, res) => {
      console.log(req.params.category);
      if (
        req.params.category == "Mobiles" ||
        req.params.category == "Clothes" ||
        req.params.category == "Furniture" ||
        req.params.category == "Books" ||
        req.params.category == "Electronics"
      ) {
        const cursor = productsCollection.find({
          category: req.params.category,
        });
        const result = await cursor.toArray();
        return res.send(result);
      }
    });

    // Getting single product data
    app.get("/products/:category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // Getting all popular data
    app.get("/popular", async (req, res) => {
      const result = await popularCollection.find().toArray();
      res.send(result);
    });

    // Posting carts data
    app.post("/carts", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await cartCollection.insertOne(product);
      res.send(result);
    });

    // Getting cart data by email
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Hey Developer. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Easy Shop server is running");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Easy Shop is running on port ${port}`);
});
