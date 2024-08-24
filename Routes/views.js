const express = require("express");
const viewsController = require("../Controllers/viewsController");
const authController = require("../Controllers/authController");
const router = express.Router();

router.get("/", authController.isLoggedIn, viewsController.getOverview);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get(
  "/me",
  authController.protect,
  authController.isLoggedIn,
  viewsController.getAccount
);

router.get(
  "/my-tours",
  authController.protect,
  authController.isLoggedIn,
  viewsController.getMyTours
);

router.post(
  "/submit-user-data",
  authController.isLoggedIn,
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
