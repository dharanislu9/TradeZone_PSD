import express from "express"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()

export async function getCaptionAndCategoryFromBLIP(imageUrl) {

    try {
        const response = await axios.post(`http://127.0.0.1:4301/caption`, { imageUrl })
        return response.data
    } catch (error) {
        console.error("Error fetching caption and category from BLIP API:", error);
        throw new Error("Failed to get caption and category");
    }
}

// Route to analyze image
router.post("/", async (req, res) => {
    const { imageUrl } = req.body

    if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" })
    }
    try {
        // Call the Python microservice to get the caption and category
        const { caption} = await getCaptionAndCategoryFromBLIP(imageUrl);
        res.status(200).json({ caption});
    } catch (error) {
        console.error("Error analyzing image:", error)
        res.status(500).json({ error: "Error analyzing image" })
    }
})

export default router