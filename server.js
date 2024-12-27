const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://revathip21it:FPoj79l3s1rLlri4@dem1.4so2efq.mongodb.net/?retryWrites=true&w=majority&appName=dem1")
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.error(err);
    });
//for user

//for product
const DBSchema = new mongoose.Schema({
    name: { type: String },
    image: { data: Buffer, contentType: String },
    price: { type: String },
    category: { type: String },
});

//for category
const CategorySchema=new mongoose.Schema({
    category:{type:String,required:true}
});

const DBModel = mongoose.model('paper', DBSchema);
const CategoryModel=mongoose.model('category',CategorySchema);

app.use(express.json());
app.use(cors());

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

//product routes
app.post('/post', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };

        const user = new DBModel({ name, image, price, category });
        const result = await user.save();
        res.send(result);
    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong");
    }
});

app.get('/get', async (req, res) => {
    try {
        const users = await DBModel.find({}, 'name image price category');
        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to retrieve data');
    }
});

app.get('/image/:id', async (req, res) => {
    try {
        const user = await DBModel.findById(req.params.id);
        if (!user || !user.image || !user.image.data) {
            return res.status(404).send('Image not found');
        }
        res.contentType(user.image.contentType);
        res.send(user.image.data);
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to retrieve image');
    }
});

app.put('/updating/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, price, category } = req.body;
    let updateData = { name, price, category };
    
    if (req.file) {
        updateData.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };
    }

    try {
        const updatedItem = await DBModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) {
            return res.status(404).send('Item not found');
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Failed to update item:', error);
        res.status(500).send('Failed to update item');
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await DBModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send('Item not found');
        }

        res.send('Item deleted successfully');
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to delete item');
    }
});

//category routes
app.post('/category',async(req,res)=>{
    try{
        const {category}=req.body;
        const newCategory=new CategoryModel({category});
        const result=await newCategory.save();
        res.send(result);
    } catch (e){
        console.log(e);
        res.status(500).send("something went wrong");
    }
})

app.get('/categories',async(req,res)=>{
    try{
        const categories=await CategoryModel.find({});
        res.json(categories);
    } catch (e) {
        console.error(e);
        res.status(500).send("failed to retrive category");
    }
})

app.put('/category/:id',async (req,res)=>{
    const {id} =req.params;
    const {category}=req.body;
    try{
        const updateCategory=await CategoryModel.findByIdAndUpdate(id,{category},{new:true});
        if(!updateCategory){
            return res.status(404).send('category not found');
        }
        res.json(updateCategory);
    } catch(error){
        console.error('Failed to update category:',error);
        res.status(500).send("Failed to update category");
    }
})

app.delete('/category/:id',async(req,res)=>{
    try{
        const {id}=req.params;
        const result=await CategoryModel.findByIdAndDelete(id);
        if(!result){
            return res.status(404).send('category not found');
        }
        res.send('category deleted successfully');
    } catch (e){
        console.error(e);
        res.status(500).send('failed to delete category');
    }
})
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
