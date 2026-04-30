import { assets } from "../assets/assets"


const Footer = () => {
  return (
    <div>
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">

            <div>
                <img className="mb-5 w-32 " src={assets.logo} alt="" />
                <p className="w-full md:w-2/3 text-gray-600">
                    Welcome to our e-commerce store, where we offer a wide range of products to meet your every need. We are committed to providing you with the best shopping experience possible, and we strive to exceed your expectations with our high-quality products and exceptional customer service. 
                </p>
            </div>

            <div>
                <p className="text-xl font-medium mb-5">COMPANY</p>
                <ul className="flex flex-col gap-1 text-gray-600">
                <li>Home</li>
                <li>About Us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
                </ul>
            </div>

            <div>
                <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
                <ul className="flex flex-col gap-1 text-gray-600">
                <li> *1-800-123-4567</li>
                <li> support@ecommerce.com</li>
                 
                </ul>
            </div>

        </div>
        <div>
            <hr className="text-gray-200" />
            <p className="py-5 text-sm text-center">
              Copyright  2026@ forever.com - All rights reserved. Designed by Mehedi Hasan Mamun.
            </p>
        </div>
    </div>
  )
}

export default Footer