import { useContext } from "react"
import { ShopContext } from "../context/ShopContext"
import { Link } from "react-router-dom";


const ProductItem = ({id,image,name,price}) => {

    const {currency, toggleWishlist, isInWishlist} = useContext(ShopContext);

  return (
    <div className="text-gray-700 cursor-pointer">
        <div className="relative overflow-hidden">
            <button
              onClick={() => toggleWishlist(id)}
              className={`absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-xs shadow-sm ${isInWishlist(id) ? "bg-black text-white" : "bg-white text-gray-700"}`}
            >
              {isInWishlist(id) ? "Saved" : "Save"}
            </button>
            <Link to={`/product/${id}`}>
            <img className="hover:scale-110 transition ease-in-out" src={image} alt="" />
            </Link>
        </div>
        <Link to={`/product/${id}`}>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">{currency}{price}</p>
        </Link>
    </div>
  )
}

export default ProductItem
