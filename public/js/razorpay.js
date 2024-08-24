const bookBtn = document.getElementById("book-tour");

if (bookBtn)
  bookBtn.addEventListener("click", (e) => {
    console.log("Book Button");
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const bookTour = async (tourId) => {
  try {
    const { data } = await axios(
      `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(data);
    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Adventure Gate",
      description: "Tour Booking",
      order_id: data.orderId,
      handler: function (response) {
        fetch("/api/v1/booking/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            tour: tourId, // Include tour details here
            user: data.user, // Add user ID or any other necessary details
            price: data.amount / 100, // Ensure price matches your backend
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              showAlert("success", "Payment successful!");
              window.location.href = data.successUrl;
            } else {
              showAlert("error", "Payment verification failed.");
              window.location.href = data.cancelUrl;
            }
          });
      },
      prefill: {
        name: "Name",
        email: "Email",
        contact: "",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  } catch (err) {
    console.error(err);
    showAlert("error", "Something went wrong.");
  }
};

const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 5000);
};
