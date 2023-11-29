const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.202owzh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        
        const testimonialsCollection = client.db("Train2Gain").collection("testimonials");



        app.get('/testimonials', async (req, res) => {
            const result = await testimonialsCollection.find().toArray();
            res.send(result);
        });


        






    } finally {
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("Train2Gain is running");
});
app.listen(port, () => {
    console.log(`Train2Gain is running on port: ${port}`);
});