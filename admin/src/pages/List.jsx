import axios from "axios";
import { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
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

  const removeProduct = async (id) => {
    try {
      setRemovingId(id);
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setRemovingId("");
    }
  };

  const totalValue = list.reduce((total, item) => total + Number(item.price || 0), 0);

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All products List</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold">{list.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-semibold">{new Set(list.map((item) => item.category)).size}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Combined Value</p>
          <p className="text-2xl font-semibold">{currency}{totalValue}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {/*---------LIST table title-------- */}

        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border border-gray-200 bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="text-center">Action</b>
        </div>

        {/*-----product list--------*/}

        {isLoading ? (
          <p className="py-6 text-sm text-gray-500">Loading products...</p>
        ) : list.map((item, index) => {
          const stockQuantity = item.stockQuantity ?? 10;

          return (
            <div
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap2 py-1 px-2 border border-gray-200 text-sm"
              key={index}
            >
              <img className="w-12" src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <p className={Number(stockQuantity) > 0 ? "text-green-600" : "text-red-500"}>
                {Number(stockQuantity) > 0 ? `${stockQuantity} in stock` : "Out of stock"}
              </p>
              <p onClick={()=>removingId ? null : removeProduct(item._id)} className={`text-right md:text-center cursor-pointer text-lg ${removingId === item._id ? "opacity-50" : ""}`}>
                {removingId === item._id ? "..." : "X"}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default List;
