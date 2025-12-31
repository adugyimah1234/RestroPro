const { Router } = require("express");
const { getQRMenuInit , placeOrderViaQrMenu, collectFeedback } = require("../controllers/qrmenu.controller");
const router = Router();

router.get(
  "/:tenantIdentifier",
  getQRMenuInit
);

router.post(
  "/:tenantIdentifier/place-order",
  placeOrderViaQrMenu
);

router.post(
  "/:tenantIdentifier/feedback",
  collectFeedback
)

module.exports = router;
