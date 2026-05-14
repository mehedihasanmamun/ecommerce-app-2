import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const fetchAllOrders = async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } },
      );

      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setUpdatingOrderId("");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const totalSales = orders.reduce((total, order) => total + Number(order.amount || 0), 0);
  const paidOrders = orders.filter((order) => order.payment).length;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Orders Page</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Paid Orders</p>
          <p className="text-2xl font-semibold">{paidOrders}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-semibold">${totalSales}</p>
        </div>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="py-6 text-sm text-gray-500">Loading orders...</p>
        ) : orders.map((order, index) => (
          <div
            key={order._id || index}
            className="grid grid-cols-1 lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border border-gray-200 p-5 text-sm text-gray-700"
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />

            <div>
              <div>
                {order.items.map((item, itemIndex) => (
                  <p key={itemIndex} className="py-0.5">
                    {item.name} x {item.quantity} <span>{item.size}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 mb-1 font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div>
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{" "}
                  {order.address.country}, {order.address.zipcode}
                </p>
              </div>
              <p className="mt-1">{order.address.phone}</p>
            </div>

            <div>
              <p>Items: {order.items.length}</p>
              <p className="mt-2">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toDateString()}</p>
            </div>

            <p className="text-base font-medium">${order.amount}</p>

            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              disabled={updatingOrderId === order._id}
              className="p-2 font-semibold border border-gray-300"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
