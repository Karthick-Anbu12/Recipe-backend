const express = require('express')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config()
const { MongoClient, ObjectId } = require("mongodb")
const app = express()
app.use(cors({
    origin: "https://recipe-application-mern.netlify.app/"
}))
const secretkey = process.env.SECRETKEY
const port = process.env.PORT
const url = process.env.URL
mongoose.connect(url).then(() => {
    console.log("Database connected successfully.");
    app.listen(port, () => {
        console.log(`Server is running on port 3000`);
    });
});
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    recipelist: [],
})
const users = mongoose.model("users", userSchema);
app.use(express.json())
//Login
app.post("/login", async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const collection = client.db().collection("users");
        const user = await collection.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" })
        }
        const passwordcorrect = await bcrypt.compare(req.body.password, user.password)
        if (!passwordcorrect) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: user._id }, secretkey)
        res.json({ message: token })
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
//Get user data
app.get("/getdata", async (req, res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();

        const collection = client.db().collection("users");

        const result = await collection.find({}).toArray();
        res.json(result)

        // console.log("Fetched data: ", result);
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
//Add user
app.post("/putdata", async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.password, salt)
    req.body.password = hash;
    let data = new users(req.body);
    const result = await data.save();
    res.send(result);
})
//Add Recipe
app.post("/addrecipe", async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const collection = client.db().collection("users");
        const id = new ObjectId("67a8e2183e417df049c06124")
        const updatecart = await collection.findOneAndUpdate({ _id: id }, { $push: { recipelist: (req.body) } })

        if (updatecart) {
            res.json(updatecart);
        }
        else {
            res.status(500).json({ message: "not updated" })
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
//Remove Recipe
app.post("/removerecipe", async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const collection = client.db().collection("users");
        const id = new ObjectId("67a8e2183e417df049c06124")
        const updatecart = await collection.findOneAndUpdate({ _id: id }, { $set: { recipelist: (req.body) } })
        if (updatecart) {
            res.json(updatecart);
        }
        else {
            res.status(500).json({ message: "not updated" })
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        await client.close();
    }
})

