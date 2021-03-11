const mysql = require("mysql") //set up mysql
const jwt = require('jsonwebtoken') //import cookies
const bcrypt = require('bcryptjs')

//connect to our database
const DB2 = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

exports.create = (req,res) => {
  try{
  
   const {EventName, type, city, state, zipcode} = req.body;
   
    

   DB2.query('INSERT INTO events SET?', {EventName: EventName, city: city, state: state, zipcode: zipcode, type: 'admin'}, (error,results) => {
       if(error){
           console.log(error)
       }else {
           res.redirect('')
       }
   })
}catch(error){
    console.log(error)
}
}