const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aczhr3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee');

        app.post('/coffee', async(req,res)=>{
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee)
            res.send(result);
        })

        app.get('/coffee', async(req,res)=> {
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        })

        app.get('/coffee/:id', async(req,res)=> {
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.put('/coffee/:id', async(req, res)=>{
            const id = req.params.id;
            const reqUpdateCoffee = req.body;
            const filter = {_id : new ObjectId(id)};
            const options = {upsert: true};
            const updateCoffee = {
                $set: {
                    name:reqUpdateCoffee.name,
                    chef:reqUpdateCoffee.chef,
                    supplier: reqUpdateCoffee.supplier,
                    taste:reqUpdateCoffee.taste,
                    category: reqUpdateCoffee.category,
                    details:reqUpdateCoffee.details,
                    photo: reqUpdateCoffee.photo
                }
            }
            const result = await coffeeCollection.updateOne(filter, updateCoffee, options)
            res.send(result)
        })

        app.delete('/coffee/:id', async(req,res)=> {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        //users api related
        const userCollection = client.db('coffeeDB').collection('coffeeUsers');
        app.post('/users', async(req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.get('/users', async(req, res)=> {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.delete('/users/:id', async(req, res)=> {
            const id = req.params.id;
            const query = { _id : new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Coffee server running successfully')
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})