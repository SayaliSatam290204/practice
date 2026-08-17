import { Link, useLocation } from "react-router-dom";
import "./OrderSuccess.css";

import {
    FaCheckCircle,
    FaLeaf,
    FaBoxOpen,
    FaArrowRight,
} from "react-icons/fa";


const OrderSuccess = () => {

    const location = useLocation();

    const order = location.state?.order;

    const orderId =
        order?._id ||
        order?.id ||
        location.state?.orderId;


    const formatPrice = (price) => {

        return Number(price || 0).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        );

    };


    return (

        <main className="order-success-page">

            <div className="order-success-container">


                {/* SUCCESS ICON */}

                <div className="order-success-icon">

                    <FaCheckCircle />

                </div>


                {/* MESSAGE */}

                <span className="order-success-eyebrow">

                    <FaLeaf />

                    Plant Nursery

                </span>


                <h1>
                    Order Placed Successfully!
                </h1>


                <p className="order-success-message">

                    Thank you for shopping with Plant Nursery.
                    Your order has been successfully placed.

                </p>


                {/* ORDER INFORMATION */}

                {orderId && (

                    <div className="order-success-details">

                        <div className="success-detail">

                            <span>
                                Order ID
                            </span>

                            <strong>
                                #
                                {orderId
                                    .slice(-8)
                                    .toUpperCase()}
                            </strong>

                        </div>


                        {order?.totalAmount !== undefined && (

                            <div className="success-detail">

                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    {formatPrice(
                                        order.totalAmount
                                    )}
                                </strong>

                            </div>

                        )}

                    </div>

                )}


                {/* NEXT STEPS */}

                <div className="order-success-info">

                    <div>

                        <FaBoxOpen />

                        <div>

                            <h3>
                                What's next?
                            </h3>

                            <p>
                                You can track your order
                                from the My Orders section.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="order-success-actions">

                    <Link
                        to="/orders"
                        className="success-orders-button"
                    >

                        <FaBoxOpen />

                        View My Orders

                        <FaArrowRight />

                    </Link>


                    <Link
                        to="/plants"
                        className="success-shopping-button"
                    >

                        <FaLeaf />

                        Continue Shopping

                    </Link>

                </div>

            </div>

        </main>

    );

};


export default OrderSuccess;