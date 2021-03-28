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
    const question = req.body.question;
    const ans = req.body.ans;
    
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
        let hashedpassword = await bcrypt.hash(password, 8); //hash the password 8 times     
        DB.query('INSERT INTO users SET ?', {UserName: name, email: email, password: hashedpassword, zipcode:zipcode, role:role, question: question, ans: ans}, (error, results) =>{ //send out the info to the users table
            if(error){
                console.log(error)
            }else{
                return res.redirect('/login')
            }
        })
    });
}

exports.forgot = async (req,res) => {
    const{email, question, ans, role} = req.body;
    try{

    }catch(error){
        console.log(error)
    }
}

exports.login = async (req,res) => {
    try{
        const {email, password, role} = req.body;

        DB.query('SELECT * FROM users WHERE email = ?', [email], async (error,results) =>{
            if(!results || !(await bcrypt.compare(password, results[0].password)) || !(role == results[0].role)){ //check if the password, email or role is incorrect.
                res.status(401).render('login', {
                    message: 'The email, password or selected role is incorrect'
                })
             }else{   
            if((results[0].role && role) == 'Admin'){ //making sure information all matches before directing user to thier home page based on thier role.
                const id = results[0].id; //cookies are bullshit.
                const token = jwt.sign({id: id}, process.env.JWT_SECRET, { //we will asign a specific cookie to the admin
                    expiresIn: process.env.JWT_EXPIRES_IN 
                })
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //When the cookie will expire
                    ),
                    httpOnly: true
                }
                 res.cookie('jwt', token, cookieOptions);
                 res.status(200).redirect('/admin') //redirect to the admin page 
             }

             else if((results[0].role && role) == 'Donor'){ //assigning this cookie will be similar to the role above
                 const id_donor = results[0].id; 
                 const token_for_donor = jwt.sign({id: id_donor}, process.env.JWT_SECRET_DONOR,{
                    expiresIn: process.env.JWT_EXPIRES_IN
                 })
                 const cookieOptionsDonor = {
                     expires: new Date(
                         Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //30 days
                     )
                 }
                 res.cookie('jwt', token_for_donor, cookieOptionsDonor)
                 res.status(200).redirect('/donor')
             }

             else if((results[0].role && role) == 'Recipient'){ //assigning this cookie will be similar to the role above
                 const id_recipient = results[0].id;
                 const token_for_recipient = jwt.sign({id: id_recipient}, process.env.JWT_SECRET_RECEP,{
                     expiresIn: process.env.JWT_EXPIRES_IN
                 })
                 const cookieOptionsRecipient = {
                     expires: new Date(
                         Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                     )
                 }
                 res.cookie('jwt', token_for_recipient, cookieOptionsRecipient)
                 res.status(200).redirect('/recipient')
             } else{
                 res.status(200).redirect('/login') //if all else fails redirect them to the home page
             }
        }})  
    }catch(error){ //catch any errors and log them to the console
        console.log(error);
    }
}

exports.is_LoggedIn_As_Admin = async(req,res,next) =>{ //work on continusly checking if the user is logged in when they redirect to a page that has private acess.
    if(req.cookies.jwt){
        try{
            //verify the users cookie token 
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            //check if the user is still existing we can use this to boot users out if they erase thier cookies or are timed out
            DB.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => { //query from the database
                if(!result){ //if not the result
                    return next(); //move forward
                }
                req.user = result[0]; //if we move past the first if we can still pass the users results and move forward
                return next();
            });
        }catch(error){ //catch any errors
            console.log(error)
            return next()
        }
    }else{
        next(); 
    }
}

exports.is_LoggedIn_As_Donor = async(req,res,next) => { //this will follow the same flow as is_LoggedIn_As_Admin
    if(req.cookies.jwt){
        try{
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_DONOR);
            DB.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error,result) => {
                if(!result){
                    return next();
                }
                req.user = result[0];
                return next();
            })
        }catch(error){
            console.log(error)
            return next ()  
        }
        }else{
            next();
        }
    }

exports.is_LoggedIn_As_Recipient = async(req,res,next) => { //this will follow the same flow as the two prior cookie functions.
    if(req.cookies.jwt){
        try{
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_RECEP);
            DB.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error,result) => {
                if(!result){
                    return next();
                }
                req.user = result[0]
                return next();
            })
        }catch(error){
            console.log(error);
            return next();
        }
    }else{
        next();
    }
}

//time to logout
exports.logout = async (req,res) => {
    res.cookie('jwt', 'leave',{
        expires: new Date(Date.now() + 1000), //make the users cookie expire instantly 
        httpOnly: true
    });
    res.status(200).redirect('/'); //redirect to the homepage.
}