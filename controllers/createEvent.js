const e = require("express");
const mysql = require("mysql") //set up mysql
const {promisify} = require ('util')
const jwt = require('jsonwebtoken') //import cookies
//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

exports.create = (req,res) => { //move the information out to the database. 
  try{
  
   const {EventName, type, date, description, city, state, eventzip} = req.body;
   
   DB.query('INSERT INTO events SET ?', {EventName: EventName, type:type, date: date, description: description, city: city, state: state, eventzip: eventzip}, async (error,results) => {
       if(error){
           console.log(error)
       }else {
           res.redirect('/admin')
       }
   })
}catch(error){
    console.log(error)
}
}
