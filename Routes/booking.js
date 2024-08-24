const express = require("express");
const bookingController = require("./../Controllers/bookingController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get(
  "/checkout-session/:tourId",
  authController.isLoggedIn,
  bookingController.getCheckoutSession
);
router.post(
  "/verify-payment",
  authController.isLoggedIn,
  bookingController.verifyPayment
);

router.use(authController.restrictTo("admin", "lead-guide"));

router.route("/").get(bookingController.getAllBookings);

router
  .route("/:id")
  .get(authController.isLoggedIn,bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
