const express = require ("express"); //express is for starting the server
const path = require('path')
const mysql = require("mysql"); //mysql database
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { allowedNodeEnvironmentFlags } = require("process");


dotenv.config({ path: './.env' }) //path info for database in the .env file

const app = express();

//this is for testing a commit and push.
//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

const publicDIR = path.join(__dirname, './public' ) //go to exact directory and go to public folder
app.use(express.static(publicDIR))

app.use(express.urlencoded({extended: false})); //parse the URL bodies sent from the HTML forms
app.use(express.json()); //parse API bodies
app.use(cookieParser()) //cookies for login tracking

app.set('view engine', 'hbs'); //set up views, and handle bar templates

DB.connect((error) => {
    if(error){
        console.log(error) //throw error in console if you cannot connect.
    }else{
        console.log("Connected to myadmin... under " + process.env.DATABASE) //print that we are connected
    }
})

//set up the new routes go to routes folder and see what routes can be rendered. Also for post methods to read input from fields
app.use('/', require('./rotues/webpages'))
app.use('/createEvent', require('./rotues/createEvent'))
app.use('/authenticate', require('./rotues/authenticate'))
app.use('/pledge', require('./rotues/pledge'))
app.use('/request', require('./rotues/request'))


//Listen for port 3000 and display once you are connected.
app.listen(3000, () => {
    console.log("Server is started and connected to port 3000")
})