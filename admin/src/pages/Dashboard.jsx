import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";

const Dashboard = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);

        const [productResponse, orderResponse] = await Promise.all([
          axios.get(backendUrl + "/api/product/list"),
          axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
        ]);

        if (productResponse.data.success) {
          setProducts(productResponse.data.products || []);
        } else {
          toast.error(productResponse.data.message);
        }

        if (orderResponse.data.success) {
          setOrders(orderResponse.data.orders || []);
        } else {
          toast.error(orderResponse.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const totalSales = orders.reduce((total, order) => total + Number(order.amount || 0), 0);
  const pendingOrders = orders.filter((order) => order.status !== "Delivered").length;
  const recentOrders = [...orders]
    .sort((a, b) => (b.date || 0) - (a.date || 0))
    .slice(0, 5);
  const bestsellingProducts = products.filter((product) => product.bestseller).length;
  const paidOrders = orders.filter((order) => order.payment).length;
  const categoryCount = new Set(products.map((product) => product.category)).size;
  const averageOrderValue = orders.length ? Math.round(totalSales / orders.length) : 0;
  const outOfStockCount = products.filter((product) => Number(product.stockQuantity ?? 10) <= 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Keep an eye on products, orders, and your latest business activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{products.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{orders.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{pendingOrders}</p>
        </div>
        <div className="border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="mt-2 text-3xl font-semibold text-gray-800">
            {currency}{totalSales}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <p className="text-sm text-gray-500">{recentOrders.length} shown</p>
          </div>

          {isLoading ? (
            <p className="py-6 text-sm text-gray-500">Loading dashboard data...</p>
          ) : recentOrders.length ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-2 rounded-sm border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items | {order.paymentMethod} | {new Date(order.date).toDateString()}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-gray-800">
                      {currency}{order.amount}
                    </p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        <div className="border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-500">Bestseller Products</p>
              <p className="font-semibold text-gray-800">{bestsellingProducts}</p>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-500">Paid Orders</p>
              <p className="font-semibold text-gray-800">{paidOrders}</p>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="font-semibold text-gray-800">{categoryCount}</p>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="font-semibold text-gray-800">{outOfStockCount}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="font-semibold text-gray-800">
                {currency}{averageOrderValue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
