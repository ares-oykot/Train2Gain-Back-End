const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = client.db("Train2Gain").collection("users");
        const bookedTrainerCollection = client.db("Train2Gain").collection("bookedTrainer");
        const scheduleCollection = client.db("Train2Gain").collection("shedule");
        const classesCollection = client.db("Train2Gain").collection("classes");


        // jwt related apis 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        });
        // middlewares
        const verifyToken = (req, res, next) => {
            // console.log("inside verifyToken", req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unAuthorize access' })
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unAuthorize access' })
                }
                req.decoded = decoded;
                next();
            });
        };

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        };


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            };
            res.send({ admin });
        });

        app.get('/users/trainer/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let trainer = false;
            if (user) {
                trainer = user?.role === 'trainer';
            };
            res.send({ trainer });
        });


        app.post('/beATrainer', verifyToken, async (req, res) => {
            const trainerInfo = req.body;
            const result = await trainerCollection.insertOne(trainerInfo);
            res.send(result);
        });
        app.get('/beATrainer', async (req, res) => {
            const result = await trainerCollection.find({ role: "trainer" }).toArray();
            res.send(result);
        });
        app.get('/appliedATrainer', verifyToken, verifyAdmin, async (req, res) => {
            const result = await trainerCollection.find({ role: "user" }).toArray();
            res.send(result);
        });
        app.get('/beATrainer/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await trainerCollection.findOne(query)
            res.send(result);
        });

        app.put('/makeTrainer/:email', verifyToken, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const options = { upsert: true };
            const role = {
                $set: {
                    role: 'trainer'
                }
            }
            const result = await trainerCollection.updateOne(filter, role, options);
            const result1 = await usersCollection.updateOne(filter, role, options);
            res.send(result1);
        });

        app.get('/testimonials', async (req, res) => {
            const result = await testimonialsCollection.find().toArray();
            res.send(result);
        });

        app.post('/blog', async (req, res) => {
            const blogInfo = req.body;
            const result = await blogCollection.insertOne(blogInfo);
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
        app.get('/blog', async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        });
        app.put('/likeBlog/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedLike = req.body;
            const like = {
                $set: {
                    like: updatedLike.like
                }
            }
            const result = await blogCollection.updateOne(filter, like, options);
            res.send(result);
        });
        app.put('/disLikeBlog/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedLike = req.body;
            const like = {
                $set: {
                    unLike: updatedLike.unLike
                }
            }
            const result = await blogCollection.updateOne(filter, like, options);
            res.send(result);
        });


        app.post('/subscribe', async (req, res) => {
            const subInfo = req.body;
            const result = await subscribeCollection.insertOne(subInfo);
            res.send(result);
        });
        app.get('/AllSubscriber', verifyToken, verifyAdmin, async (req, res) => {
            const result = await subscribeCollection.find().toArray();
            res.send(result);
        });

        app.get('/gallery', async (req, res) => {
            const result = await galleryCollection.find().toArray();
            res.send(result);
        });

        app.post('/bookedTrainer', verifyToken, async (req, res) => {
            const bookedInfo = req.body;
            const result = await bookedTrainerCollection.insertOne(bookedInfo);
            res.send(result);
        });
        app.get('/manageSlot/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { trainerEmail: email };
            const result = await bookedTrainerCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/schedule', async (req, res) => {
            const result = await scheduleCollection.find().toArray();
            res.send(result);
        });
        
        app.post('/addClasses', verifyToken, async (req, res) => {
            const classInfo = req.body;
            const result = await classesCollection.insertOne(classInfo);
            res.send(result);
        })
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
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
// nothing