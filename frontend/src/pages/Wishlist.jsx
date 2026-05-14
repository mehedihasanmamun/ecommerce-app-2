import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Wishlist = () => {
  const { products, wishlistItems, toggleWishlist, navigate, currency } = useContext(ShopContext);

  const savedProducts = products.filter((product) => wishlistItems.includes(product._id));

  return (
    <div className="border-t border-gray-200 pt-16 min-h-[60vh]">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>

      {!savedProducts.length ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-700">Your wishlist is empty.</p>
          <p className="mt-2 text-sm text-gray-500">
            Save products here to keep track of your favorites.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="mt-6 bg-black text-white px-6 py-3 text-sm"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {savedProducts.map((item) => (
            <div key={item._id} className="border border-gray-200 p-4">
              <img
                onClick={() => navigate(`/product/${item._id}`)}
                className="w-full h-72 object-cover cursor-pointer"
                src={item.image[0]}
                alt={item.name}
              />
              <p className="mt-4 text-lg font-medium text-gray-800">{item.name}</p>
              <p className="mt-1 text-sm text-gray-500">{item.category} | {item.subCategory}</p>
              <p className="mt-2 text-base font-semibold text-gray-800">
                {currency}{item.price}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="flex-1 border border-gray-300 px-4 py-2 text-sm"
                >
                  View Product
                </button>
                <button
                  onClick={() => toggleWishlist(item._id)}
                  className="flex-1 bg-black text-white px-4 py-2 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
