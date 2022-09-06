const router = require("express").Router();
const controller = require("./orders.controller")


router.route("/").get(controller.list).post(controller.create)
router.route("/:orderId").get(controller.read).put(controller.update).delete(controller.delete)

// TODO: Implement the /orders routes needed to make the tests pass

module.exports = router;
