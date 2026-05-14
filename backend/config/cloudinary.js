import { v2 as cloudinary } from "cloudinary"

const connectClodinary = async () => {
    const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary environment variables")
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    })
}

export default connectClodinary;
