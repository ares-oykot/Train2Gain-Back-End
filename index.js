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
        const blogCollection = client.db("Train2Gain").collection("blog");
        const subscribeCollection = client.db("Train2Gain").collection("subscribe");
        const galleryCollection = client.db("Train2Gain").collection("gallery");
        const trainerCollection = client.db("Train2Gain").collection("trainer");


        app.post('/beATrainer', async (req, res) => {
            const trainerInfo = req.body;
            const result = await trainerCollection.insertOne(trainerInfo);
            res.send(result);
        });


        app.get('/testimonials', async (req, res) => {
            const result = await testimonialsCollection.find().toArray();
            res.send(result);
        });


        app.get('/latest-blog', async (req, res) => {
            try {
                const latestBlog = await blogCollection
                    .find()
                    .sort({ uploadDate: -1 })
                    .limit(1)
                    .toArray();

                if (latestBlog.length > 0) {
                    res.send(latestBlog[0]);
                } else {
                    res.status(404).send('No blogs found');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/subscribe', async (req, res) => {
            const subInfo = req.body;
            const result = await subscribeCollection.insertOne(subInfo);
            res.send(result);
        });

        app.get('/gallery', async (req, res) => {
            const result = await galleryCollection.find().toArray();
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