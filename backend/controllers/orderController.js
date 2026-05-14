import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const currency = "usd";

const getStripeClient = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY in backend/.env");
    }

    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const getStripeImageUrls = (images = []) =>
    images.filter((image) => typeof image === "string" && /^https?:\/\//i.test(image));

const normalizeBaseUrl = (url) => (url || "").trim().replace(/\/+$/, "");

// Placing orders using COD Method

const placeOrder = async (req,res) => {

    try {

        const { userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const neworder = new orderModel(orderData)
        await neworder.save()
        
        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method

const placeOrderStripe = async (req,res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        if (!items?.length) {
            return res.json({ success: false, message: "No items found for this order" });
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const stripe = getStripeClient();
        const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL || origin || "http://localhost:5173");

        const line_items = items.map((item) => ({
            price_data: {
                currency,
                product_data: {
                    name: item.name,
                    images: getStripeImageUrls(item.image),
                },
                unit_amount: Math.round(Number(item.price) * 100),
            },
            quantity: item.quantity,
        }));

        const deliveryCharge = Math.max(amount - items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0), 0);

        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency,
                    product_data: {
                        name: "Delivery Charges",
                    },
                    unit_amount: Math.round(deliveryCharge * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items,
            success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
            metadata: {
                orderId: newOrder._id.toString(),
                userId,
            },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing orders using bKash Method
const placeOrderBkash = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        if (!process.env.BKASH_USERNAME || !process.env.BKASH_PASSWORD || !process.env.BKASH_APP_KEY || !process.env.BKASH_APP_SECRET_KEY) {
            return res.json({
                success: false,
                message: "bKash merchant credentials are missing in backend/.env",
            });
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "bKash",
            payment: false,
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        res.json({
            success: false,
            message: "bKash UI has replaced Razorpay, but live bKash API checkout still needs your merchant credentials and official callback details.",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// All Orders data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, sessionId, userId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: "Order id is required" });
        }

        if (success !== "true") {
            await orderModel.findOneAndDelete({ _id: orderId, userId });
            return res.json({ success: false, message: "Payment cancelled" });
        }

        if (!sessionId) {
            return res.json({ success: false, message: "Missing Stripe session id" });
        }

        const stripe = getStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            await orderModel.findOneAndUpdate({ _id: orderId, userId }, { payment: true });
            const order = await orderModel.findOne({ _id: orderId, userId });

            if (!order) {
                return res.json({ success: false, message: "Order not found for this user" });
            }

            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            return res.json({ success: true, message: "Payment successful" });
        }

        res.json({ success: false, message: "Payment not completed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//  User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//   update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {placeOrder, placeOrderStripe, placeOrderBkash, allOrders, userOrders, updateStatus, verifyStripe}
