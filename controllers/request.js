const mysql = require("mysql") //set up mysql

//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

exports.request = (req,res) =>{
 try{
    const{id, UserName, request, type, item, quan, city, state, zipcode} = req.body
    //insert request form into the DB
    DB.query('INSERT INTO request SET ?', {usersid: id, UserName: UserName, request: request, type: type, item: item, quantity: quan, city: city, state: state, requestzip: zipcode}, async (error, results) => {
        if(error){
            console.log(error)
        } else{
            res.redirect('/recipient')
        }
    })
} catch(error){
    console.log(error)
}
}