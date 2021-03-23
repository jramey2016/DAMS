const mysql = require("mysql") //set up mysql

//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

exports.createpledge =  (req,res) =>{
try{
    const{id, UserName, pledge, type, item, quan, city, state, zipcode} = req.body
    
   DB.query('INSERT INTO pledge SET?',{usersid: id, UserName: UserName, pledge: pledge, type: type, item: item, quantity: quan, city: city, state: state, pledgezip: zipcode} ,async(error,results) => {
        if(error){
        console.log(error)
        }else {
        res.redirect('/donor')
        }
   })
}catch(error){
    console.log(error)
}
}