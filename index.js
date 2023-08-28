const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
});
const upload = multer({ storage: storage});


const app = express();
const port = 4000;

app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(bodyParser.json());


const url = 'mongodb+srv://oliverleonor90:oliviaElise@cluster0.hq1klr7.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// POST request to create a profile

app.post('/create-profile', upload.single('profile_picture'), async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('sample-profile').collection('profiles');

        const documentToInsert = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            profile_picture: req.file ? req.file.path : 'default/path',
            bio: req.body.bio || '',
        }

        console.log('Document to insert:', documentToInsert);
        console.log('Uploaded file:', req.file);

        const result = await collection.insertOne(documentToInsert);

       if (result && result.acknowledged) {
            res.status(201).json({ status: 'success', data: {insertedID: result.insertedId } });
        } else {
            res.status(400).json({ status: 'fail', message: 'No data to insert' });
        }
    } catch (error) {
        console.log('An error occured:', error);
        res.status(500).json({ status: 'fail', message: error.message });  
    } finally {
        await client.close();
    }
});

// GET request to retrieve a profile

app.get('/get-profile/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('sample-profile').collection('profiles');
        const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (result) {
            res.status(200).json({ status: 'success', data: result });
        } else {
            res.status(404).json({ status: 'fail', message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }   
});

// PUT request to update a profile

app.put('/update-profile/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('sample-profile').collection('profiles');

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ status: 'success', data: 'Profile updated successfully' });
        } else {
            res.status(404).json({ status: 'fail', message: 'Could not update profile' });
        }
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// DELETE request to delete a profile

app.delete('/delete-profile/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('sample-profile').collection('profiles');
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        
        if (result.deletedCount > 0) {
            res.status(200).json({ status: 'success', message: 'Profile deleted' });
        } else {
            res.status(404).json({ status: 'fail', message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});