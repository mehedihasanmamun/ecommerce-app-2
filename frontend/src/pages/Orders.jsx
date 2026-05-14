import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const orderSteps = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState("");

  const loadOrderData = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setOrderData(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const toggleTracking = async (orderId) => {
    if (trackingOrderId === orderId) {
      setTrackingOrderId("");
      return;
    }

    await loadOrderData();
    setTrackingOrderId(orderId);
  };

  return (
    <div className="border-t border-gray-200 pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.flatMap((order) =>
          order.items.map((item, index) => (
            <div
              key={`${order._id}-${index}`}
              className="py-4 border-t border-b border-gray-200 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-400">
                      {new Date(order.date).toDateString()}
                    </span>
                  </p>

                  <p className="mt-1">
                    Payment:{" "}
                    <span className="text-gray-400">
                      {order.paymentMethod}
                    </span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base">{order.status}</p>
                </div>
                <button
                  onClick={() => toggleTracking(order._id)}
                  className="border border-gray-200 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer"
                >
                  {trackingOrderId === order._id ? "Hide Tracking" : "Track Order"}
                </button>
              </div>
              {trackingOrderId === order._id && (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Order ID: {order._id}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {orderSteps.map((step, stepIndex) => {
                      const currentStepIndex = orderSteps.indexOf(order.status);
                      const isCompleted = stepIndex <= currentStepIndex;
                      const isCurrent = step === order.status;

                      return (
                        <div
                          key={step}
                          className={`rounded-md border p-3 ${
                            isCompleted
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isCompleted ? "bg-green-500" : "bg-gray-300"
                              }`}
                            ></span>
                            <p className="text-sm font-medium text-gray-800">
                              {step}
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {isCurrent
                              ? "Current order status"
                              : isCompleted
                                ? "Completed"
                                : "Waiting"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Orders;
