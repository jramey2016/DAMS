const mysql = require("mysql") //set up mysql
const jwt = require('jsonwebtoken') //import cookies
const bcrypt = require('bcryptjs')
const {promisify} = require ('util')


//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/



exports.registration = async (req,res) => { //move on past authenticate
    const name = req.body.UserName; //get username
    const email = req.body.email; //get email
    const password = req.body.password; //get the inputed password
    const Confirm = req.body.Confirmpassword;
    const zipcode = req.body.zipcode; //get the zipcode
    const role = req.body.role; //get the users role

    DB.query('SELECT email FROM users WHERE email = ?', [email], async (error,results) => {
        if(error){
            console.log(error); //log any errors
        }
        if(results.length > 0){ //check if email is already in use
            return res.render('register', {
                message: "This email is taken"
            });
        }
        else if (password !== Confirm){ //check if passwords match
            return res.render('register', {
                message: "These passwords do not match"
            });
        }
        let hashpass = await bcrypt.hash(password,8); //hash the password 8 times
        console.log(hashpass);
        
       
    });  
    
    DB.query('INSERT INTO users SET ?', {UserName: name, email: email, password:password, zipcode:zipcode, role:role}, (error, results) =>{ //send out the info
        if(error){
            console.log(error)
        }else{
            console.log(results)
            return res.redirect('/')
        }
    })
}
    

exports.login = async (req,res) => {
    try{
        const {email, password, role} = req.body;

        DB.query('SELECT * FROM users WHERE email = ?', [email],  (error,results) =>{
            console.log(results)
            if(!results || !(bcrypt.compare(password,results[0].password)) || !(role == results[0].role)){ //check if the password, email or role is incorrect.
                res.status(401).render('login', {
                    message: 'The email, password or selected role is incorrect'
                })
             }else{
                const id = results[0].id; //cookies are bullshit.
                const token = jwt.sign({id: id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN 
                })
                console.log("The user token is" + token)
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //MS
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                
            if((results[0].role && role) == 'Admin'){ //making sure information all matches before directing user to thier home page based on thier role.
                 res.status(200).redirect('/admin')
             }
             else if((results[0].role && role) == 'Donor'){
                 res.status(200).redirect('/donor')
             }
             else if((results[0].role && role) == 'Recipient'){
                 res.status(200).redirect('/recipient')
             } else{
                 res.status(200).redirect('/login')
             }
        }})
         
    }catch(error){
        console.log(error);
    }
}

exports.isLoggedIn = async(req,res,next) =>{ //seriously screw cookies
    console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            //verify the users cookie token 
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            console.log(decoded);

            //check if the user is still existing we can use this to boot users out if they erase thier cookies or are timed out
            DB.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                if(!result){
                    return next();
                }
                req.user = result[0];
                return next();
            });
        }catch(error){
            console.log(error)
            return next()
        }
    }else{
    next(); 
    }
}

//time to logout
exports.logout = async (req,res) => {
    res.cookie('jwt', 'leave',{
        expires: new Date(Date.now() + 1000), //time for your cookie to expire 
        httpOnly: true
    });
    res.status(200).redirect('/') //redirect to the homepage.
}