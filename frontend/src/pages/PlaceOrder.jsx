import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
// import { data } from "react-router";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { navigate,backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFromData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFromData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    try {
      const phoneRegex = /^[0-9]{10,15}$/
      const zipcodeRegex = /^[0-9]{4,10}$/

      let orderItems = []

      for(const items in cartItems){
        for(const item in cartItems[items]){
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      }

      if (!token) {
        toast.error("Please login to place an order")
        navigate('/login')
        return
      }

      if (!orderItems.length) {
        toast.error("Your cart is empty")
        return
      }

      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please enter your full name")
        return
      }

      if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
        toast.error("Please complete your delivery address")
        return
      }

      if (!phoneRegex.test(formData.phone.trim())) {
        toast.error("Please enter a valid phone number")
        return
      }

      if (!zipcodeRegex.test(formData.zipcode.trim())) {
        toast.error("Please enter a valid zipcode")
        return
      }

      setIsSubmitting(true)

      switch (method) {

        //API Calls for COD

        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData,{headers:{token}})
          if (response.data.success) {
            setCartItems({})
            localStorage.removeItem("cartItems")
            toast.success(response.data.message)
            navigate('/orders')
          } else {
            toast.error(response.data.message)
          }
          break;
        }

        case 'stripe': {
          const response = await axios.post(backendUrl + '/api/order/stripe', orderData,{headers:{token}})
          if (response.data.success && response.data.session_url) {
            window.location.replace(response.data.session_url)
          } else {
            toast.error(response.data.message)
          }
          break;
        }

        case 'bkash': {
          const response = await axios.post(backendUrl + '/api/order/bkash', orderData,{headers:{token}})
          toast[response.data.success ? "success" : "error"](response.data.message)
          break;
        }
      
        default:
          toast.error("Selected payment method is not ready yet")
          break;
      }
      
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/*--------left side-------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="firstName" value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
            disabled={isSubmitting}
          />
          <input required onChange={onChangeHandler} name="lastName" value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
            disabled={isSubmitting}
          />
        </div>

        <input required onChange={onChangeHandler} name="email" value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email Address"
          disabled={isSubmitting}
        />

        <input required onChange={onChangeHandler} name="street" value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
          disabled={isSubmitting}
        />

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="city" value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
            disabled={isSubmitting}
          />
          <input required onChange={onChangeHandler} name="state" value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="zipcode" value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Zipcode"
            disabled={isSubmitting}
          />
          <input required onChange={onChangeHandler} name="country" value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
            disabled={isSubmitting}
          />
        </div>

        <input required onChange={onChangeHandler} name="phone" value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Phone"
          disabled={isSubmitting}
        />
      </div>

      {/*---------right side--------- */}

      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*payment method selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 border border-gray-200 p-2 px-3 cursor-pointer ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
            >
              <p
                className={`min-w-3.5 h-3.5 border border-gray-200 rounded-full ${method === "stripe" ? "bg-green-400" : ""} `}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="" />
            </div>

            <div
              onClick={() => setMethod("bkash")}
              className={`flex items-center gap-3 border border-gray-200 p-2 px-3 cursor-pointer ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
            >
              <p
                className={`min-w-3.5 h-3.5 border border-gray-200 rounded-full ${method === "bkash" ? "bg-green-400" : ""} `}
              ></p>
              <p className="text-pink-600 text-sm font-semibold mx-4">
                bKash
              </p>
            </div>

            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border border-gray-200 p-2 px-3 cursor-pointer ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
            >
              <p
                className={`min-w-3.5 h-3.5 border border-gray-200 rounded-full ${method === "cod" ? "bg-green-400" : ""} `}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-16 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "PROCESSING..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
