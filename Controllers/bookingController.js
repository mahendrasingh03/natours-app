const Tour = require("./../Models/tours.js");
const Booking = require("./../Models/bookingModel.js");
const catchAsync = require("./../utils/CatchAsync.js");
const AppError = require("./../utils/AppError");
const factory = require("./handlerFactory");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const order = await razorpay.orders.create({
    amount: tour.price * 100,
    currency: "INR",
    receipt: crypto.randomBytes(10).toString("hex"),
    payment_capture: "1",
  });

  res.status(200).json({
    status: "success",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    user: req.user._id,
    key: process.env.RAZORPAY_KEY_ID,
    successUrl: `${req.protocol}://${req.get("host")}/`,
    cancelUrl: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
  });
});

// Verify Razorpay payment
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { paymentId, orderId, signature, tour, user, price } = req.body;
  // Generate the signature using your secret key
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Verify the signature
  if (generatedSignature === signature) {
    // Signature is valid
    if (!tour || !user || !price) return next(new AppError("Booking failed"));
    await Booking.create({ tour, user, price });
    res.json({
      status: "success",
      successUrl: `${req.protocol}://${req.get("host")}/`,
    });
  } else {
    res.json({
      status: "fail",
      cancelUrl: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    });
  }
});


exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
