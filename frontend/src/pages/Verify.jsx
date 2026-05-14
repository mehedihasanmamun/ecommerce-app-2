import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Verify = () => {
  const { backendUrl, token, setCartItems } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get("success");
      const orderId = searchParams.get("orderId");
      const sessionId = searchParams.get("session_id");

      if (!token) {
        toast.error("Please login again to verify payment");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axios.post(
          backendUrl + "/api/order/verifyStripe",
          { success, orderId, sessionId },
          { headers: { token } },
        );

        if (response.data.success) {
          setCartItems({});
          localStorage.removeItem("cartItems");
          toast.success(response.data.message);
          navigate("/orders", { replace: true });
        } else {
          toast.error(response.data.message);
          navigate("/placeorder", { replace: true });
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        navigate("/placeorder", { replace: true });
      }
    };

    verifyPayment();
  }, [backendUrl, navigate, searchParams, setCartItems, token]);

  return (
    <div className="border-t border-gray-200 min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-600 text-lg">Verifying your Stripe payment...</p>
    </div>
  );
};

export default Verify;
