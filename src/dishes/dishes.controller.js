const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function bodyDataHas(propertyName){ 
    return function (req ,res, next) {
    const {data ={}} = req.body
    if(data[propertyName]){
       return next()
    }
    next({
        status: 400,
        message: `Dish must include a ${propertyName}` 
    })}
}

function hasIntegerProperty(req, res, next){
    const {data: {price} = {}} = req.body
    if(price > 0 && Number.isInteger(price)){
        return next()
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })
}

function dishExists(req, res, next) {
    const {dishId} = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id does not exist ${dishId}`
    })
}

function dishIdMatch(req, res, next){
    const {dishId} = req.params;
    const {data: {id} ={}} = req.body;
   
    if(id === dishId || id === null || id === undefined || id === ""){
        return next()
    }
    next({
        status:400,
        message: `Dish id does not match route id. Dish : ${id}, Route: ${dishId}`
    })
}

function list(req,res) {
    res.json({ data: dishes})
}

function create(req, res){
    const { data: {name, price, description, image_url} = {}} = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({data : newDish})
}

function read(req, res, next) {
    res.json({data: res.locals.dish})
}

function update(req, res){
    const dish = res.locals.dish
    const { data: {name, price, description, image_url} = {}} = req.body

    dish.name = name;
    dish.price = price;
    dish.description = description;
    dish.image_url = image_url;

    res.json({data: dish})
}

module.exports = {
    create:[
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        hasIntegerProperty,
        create
    ],
    list,
    read:[dishExists, read],
    update:[
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        hasIntegerProperty, 
        dishIdMatch,
        update
    ]
}