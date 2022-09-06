const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${propertyName}`,
    });
  };
}

function dataIsArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length && Array.isArray(dishes)) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

function hasIntegerProperty(req, res, next) {
  const { data: { dishes } } = req.body;
  dishes.forEach(({quantity}, index) => {
    if (quantity > 0 && typeof quantity === "number" && quantity) {
        null;
      } else {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      })};
  })
  next()
  
}

function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id does not exist ${orderId}`
    })
}

function orderIdMatch(req, res, next){
    const {orderId} = req.params;
    const {data: {id} ={}} = req.body;
   
    if(id === orderId || !id || id.length === 0){
        return next()
    }
    next({
        status:400,
        message: `Order id does not match route id. Order : ${id}, Route: ${orderId}`
    })
}

function statusPropIsValid(req, res, next) {
    const {data: {status} = {}} = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"]
    if(validStatus.includes(status)){
        next()
    }
    next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

function orderedOrder(req, res, next) {
    const order = res.locals.order
    if(order.status === "pending"){
        next()
    }
    next({
        status: 400,
        message: "pending"
    })
}

function create(req,res){ 
    const { data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder);
    res.status(201).json({data : newOrder})
}

function read(req, res){
    res.json({data: res.locals.order})
}

function update(req, res){
    const order = res.locals.order
    const { data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order})
}

function destroy(req, res){
    const {orderId} =req.params;
    const index = orders.findIndex(order => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dataIsArray,
    hasIntegerProperty,
    create
  ],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    orderIdMatch,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dataIsArray,
    hasIntegerProperty,
    statusPropIsValid,
    update
  ],
  delete:[
    orderExists,
    orderedOrder,
    destroy
  ]
};
