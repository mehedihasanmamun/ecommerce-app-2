import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

const parseSizes = (sizes) => {
    if (!sizes) {
        return []
    }

    if (Array.isArray(sizes)) {
        return sizes
    }

    if (typeof sizes === "string") {
        try {
            const parsed = JSON.parse(sizes)
            return Array.isArray(parsed) ? parsed : [parsed]
        } catch {
            return sizes.split(",").map((item) => item.trim()).filter(Boolean)
        }
    }

    return [sizes]
}

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, stockQuantity } = req.body

        if (!req.files) {
            return res.json({ success: false, message: "No images were uploaded" })
        }

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        if (!images.length) {
            return res.json({ success: false, message: "At least one product image is required" })
        }

        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: parseSizes(sizes),
            stockQuantity: Math.max(Number(stockQuantity) || 0, 0),
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log("addProduct error:", error);

        if (error?.http_code === 403) {
            return res.json({
                success: false,
                message: "Cloudinary authorization failed. Use valid CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values."
            })
        }

        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log("listProducts error:", error);
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })
    } catch (error) {
        console.log("removeProduct error:", error);
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log("singleProduct error:", error);
        res.json({ success: false, message: error.message })
    }
}



export { listProducts, addProduct, removeProduct, singleProduct }
