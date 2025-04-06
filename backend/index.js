require('dotenv').config();

const config = require('./config.json')
const mongoose = require('mongoose') 
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const upload = require('./multer');
const fs = require('fs');
const path = require('path')

const { authenticateToken } = require('./utilities')

const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');
const { resolveSoa } = require('dns');
const { error } = require('console');


mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

//info: Create Account
app.post("/create-account", async (req, res ) => {
    const { fullName, email, password} = req.body;

    if(!fullName || !email || !password){
        return res.status(400).json({ error: true, message: "All fields are required"})
    }

    const isUser = await User.findOne({ email });
    if(isUser){
        return res.status(400).json({ error: true, message: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullName,
        email,
        password: hashedPassword,
    });
    
    await user.save();

    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn:"72h",
        }
    );

    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email},
        accessToken,
        message: "Regestration Successfull"
    });
});

// info: Login
app.post("/login", async (req, res ) => {
    const { email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"Email and Password are required"});
    }
    const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json({ message:"User not found"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({ message: "Invalid Credentials"})
    }

    const accessToken = jwt.sign(
        { userId:user._id},
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn:"72h"
        }
    );

    return res.json({
        error: false,
        message: "Login Successful",
        user: {fullName: user.fullName, email: user.email },
        accessToken,
    })
});

// info: Get User
app.get("/get-user",authenticateToken, async (req, res ) => {
    const { userId } = req.user
    
    const isUser = await User.findOne({_id: userId});

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "",
    });

});

// info: Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: "No image uploaded",
            });
        }

        const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

// info: delete an image from upload folder
app.delete('/delete-image', async (req, res) =>{
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res 
        .status(400)
        .json({ error: true, message:"ImageUrl parameter is required" });
    }

    try{
        // note: extract the filename from the imageUrl
        const filename = path.basename(imageUrl);
        // note: Define the file path
        const filePath = path.join(__dirname, 'uploads', filename);

        // info: check if the file exists
        if(fs.existsSync(filePath)){
            // note: Delete the file from the uploads folder
            fs.unlinkSync(filePath);
            res.status(200).json({message: "Image deleted successfully"})
        } else{
            res.status(200).json({error:true, message: "Image not Found "})
        }
    }
    catch(error){
         res.status(500).json({ error: true, message: error.message })
    }
});

// info: serve static files from the uploads assets directory

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// info: add story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // info: Validate required fields
    if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    // info: convert visitedDate from milliseconds to Date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try {
        const travelStory = new TravelStory({ // Use TravelStory instead of travelStory
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate,
        });
        await travelStory.save();
        res.status(201).json({ story: travelStory, message: "Added Successfully" });

    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

// info: get all travel stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
    const { userId } = req.user;

    try {
        const travelStories = await TravelStory.find({ userId: userId }).sort({ isFavourite: -1 });
        res.status(200).json({ error: false, stories: travelStories }); // Send the response
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// info: Edit story
app.put('/edit-story/:id', authenticateToken, async (req, res) => { 
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // info: Validate required fields
    if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    // info: Convert visitedDate from milliseconds to Date object
    const parsedVisitedDate = new Date(Number(visitedDate));
    if (isNaN(parsedVisitedDate.getTime())) {
        return res.status(400).json({ error: true, message: "Invalid visitedDate format" });
    }

    try {
        // info: Find the travel story by ID and ensure it belongs to the authenticated user
        const travelStory = await TravelStory.findOne({ _id: id, userId });

        if (!travelStory) {
            return res.status(404)
            .json({ error: true, message: "Travel story not found" });
        }

        const placeholderImgUrl = 'http://localhost:3000/assets/placeholder.jpg';

        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocation = visitedLocation;
        travelStory.imageUrl = imageUrl || placeholderImgUrl;
        travelStory.visitedDate = parsedVisitedDate;

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: 'Update Successful' });

    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});


// info: delete a travel story
app.delete('/delete-story/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        // info: Find the travel story by ID and ensure it belongs to the authenticated user
        const travelStory = await TravelStory.findOne({ _id: id, userId });

        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        // info: Delete the travel story from the database
        await travelStory.deleteOne();

        // info: Extract the filename from the imageUrl
        const imageUrl = travelStory.imageUrl;
        const filename = path.basename(imageUrl); // Extract filename from URL

        // info: Construct full file path
        const filePath = path.join(__dirname, 'uploads', filename); // Adjust the folder path as needed

        // info: Check if file exists before deleting
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Failed to delete image file:", err);
                } else {
                    console.log("Image file deleted successfully:", filename);
                }
            });
        } else {
            console.warn("Image file not found:", filename);
        }

        res.status(200).json({ message: "Travel story deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});


// info: Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const { userId } = req.user;
    
    try{
        const travelStory = await TravelStory.findOne({ _id:id, userId: userId });

        if(!travelStory){
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        travelStory.isFavourite = isFavourite;
        await travelStory.save();
        res.status(200).json({ story:travelStory, message:'Update Successful' });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// info: search
app.get('/search', authenticateToken, async (req, res) => {
    let { query } = req.query;
    const { userId } = req.user;

    console.log("Received Query:", query); // Debugging
    console.log("User ID:", userId); // Debugging

    // ✅ Input validation
    if (!query || typeof query !== 'string' || query.trim() === "") {
        console.log("Empty query detected, returning empty array"); // Debugging
        return res.status(200).json({ 
            error: false, 
            message: "Query is empty", 
            stories: [] 
        });
    }

    query = query.trim(); // Ensure query has no extra spaces
    console.log("Trimmed Query:", query); // Debugging

    try {
        const searchQuery = {
            userId: userId,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { story: { $regex: query, $options: "i" } },
                { visitedLocation: { $regex: query, $options: "i" } }
            ],
        };

        console.log("MongoDB Query:", searchQuery); // Debugging

        const searchResults = await TravelStory.find(searchQuery).sort({ isFavourite: -1 });

        console.log("Search Results:", searchResults); // Debugging

        // ✅ Handle no results
        if (searchResults.length === 0) {
            return res.status(200).json({ 
                error: false, 
                message: "No stories found", 
                stories: [] 
            });
        }

        // ✅ Success response
        res.status(200).json({ 
            error: false, 
            message: "Stories retrieved successfully", 
            stories: searchResults 
        });
    } catch (error) {
        console.error("Search Error:", error); // Log the error for debugging
        res.status(500).json({ 
            error: true, 
            message: "Internal server error" 
        });
    }
});

// info: filter travel stories by date range
app.get('/travel-stories/filter', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    try {
        // ✅ Convert milliseconds to Date objects
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));

        console.log("Filtering stories from:", start, "to", end); // Debugging

        // ✅ Find travel stories within date range
        const filteredStories = await TravelStory.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end },
        }).sort({ isFavourite: -1 });

        console.log("Filtered Stories:", filteredStories); // Debugging

        res.status(200).json({ stories: filteredStories });
    } catch (error) {
        console.error("🔥 Error:", error);
        res.status(500).json({ error: true, message: error.message });
    }
});



app.listen(3000);
module.exports = app;