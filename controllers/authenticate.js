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

exports.forgot = async (req,res,next) => {
    const{email, question, ans} = req.body;
    try{
        DB.query('SELECT * FROM users WHERE email = ?', [email], async(error,result) =>{
           
            if(!result){
                res.status(401).render('forgot',{
                    message: 'The information you entered is incorrect'
                })
                return next()
            }
           if(!(question == result[0].question) || !(ans == result[0].ans)){
                res.status(401).render('forgot',{
                    message: 'The information you entered is incorrect'
                })
            }else{
                res.redirect('/change')
            }
        })
    }catch(error){
        next(error)
    }
}

exports.login = async (req,res) => {
    try{
        const {email, password, role} = req.body;
        console.log(email)
        DB.query('SELECT * FROM users WHERE email = ?', [email], async (error,results) =>{
            console.log(results[0].password)
            console.log(results[0].role)
            if(!results ||  !(await bcrypt.compare(password, results[0].password)) || !(role == results[0].role)){ //check if the password, email or role is incorrect.
                res.status(401).render('login', {
                    message: 'The email, password or selected role is incorrect'
                })
             }else{   
            if((results[0].role && role) == 'Admin'){ //making sure information all matches before directing user to thier home page based on thier role.
                const id = results[0].id;
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

exports.updateEvent = async(req,res) => { //admin allowed to modify an event will redirect them to the edit page to update the event
    var id = req.body.id
    console.log(id)
    DB.query('SELECT * FROM events WHERE id =?',[id],async(error,results) =>{
        console.log(results)
        res.render('editEvent', {events: results})
    })
}//direct user to edit event page.

exports.updateEventConfirm = async (req,res) => {
    const{id, EventName, type, date, city, description, state, eventzip} = req.body
    DB.query('UPDATE events set EventName = ?, type = ?, date =?, city = ?, description = ?, state =?, eventzip = ? WHERE id = ?', [EventName, type, date, city, description,state,eventzip, id], async (error,results) =>{
        DB.query('SELECT * FROM events', (error,results2) => {
            if(error){
                console.log(error)
            }else{
                res.render('viewEvent', {event: results2})
            }
        })
    })
}

exports.delEvent = async(req,res) => { //admin delete event
    try{
        const {id} = req.body
        DB.query('DELETE FROM events WHERE id = ?', [id], async(error,results) =>{
            if(error){
                console.log(error)
            }else{
                res.redirect('/viewEvent')
            }
        })
    }catch(error){
        console.log(error)
    }
}

exports.delPledge = async (req,res) =>{ //donor to delete their pledge
  try{
      const{id} = req.body
      DB.query('DELETE from pledge WHERE id = ?', [id], async(error,results) =>{
          if(error){
              console.log(error)
          } else{
              res.redirect('/donor')
          }
      })
  }catch(error){
      console.log(error)
  }
}

exports.delRequest = (req,res) => { //where a user can delete thier request 
    try{
        const{id} = req.body
        DB.query('DELETE from request WHERE id = ?', [id], async(error,results) =>{
            if(error){
                console.log(error)
            } else{
                res.redirect('/recipient')
            }
        })
    }catch(error){
        console.log(error)
    }
}

exports.deleteRA = (req,res) => { //ability for admin to delete a request
    try{
        const{id} = req.body
        DB.query('DELETE from request where id = ?',[id], async(error,results) => {
            if(error){
                console.log(error)
            }else{
                res.redirect('/requestQ')
            }
        })
    }catch (error){
        console.log(error)
    }
}

exports.deletePA = (req,res) =>{ //admin can delete a pledge
    try{
        const{id} = req.body
        DB.query('DELETE from pledge where id = ?',[id], async(error,results) =>{
            if(error){
                console.log(error)
            }else{
                res.redirect('/donorQ')
            }
        })
    } catch (error){
        console.log(error)
    }
}


exports.searchrecepPQ = (req,res) =>{ //search for the pledge screen (Recipient side)
    try{
        const {pledgezip} = req.body
        console.log(pledgezip)
        DB.query('SELECT * FROM pledge WHERE pledgezip = ?', [pledgezip], (error,results) => {
            console.log(results)
            res.render('recepPQ', {pledge:results})
        })
    }catch(error){
        console.log(error)
    }
}

exports.searchdonorQ = (req,res) => {
    try{
        const {pledgezip} = req.body
        console.log(pledgezip)
        DB.query('SELECT * FROM pledge WHERE pledgezip = ?', [pledgezip], (error,results) => {
            console.log(results)
            res.render('donorQ', {pledge:results})
        })
    }catch(error){
        console.log(error)
    }
}

exports.searchdonorRQ = (req,res) => {
    try{
        const {requestzip} = req.body
        console.log(requestzip)
        DB.query('SELECT * FROM request WHERE requestzip = ?', [requestzip], (error,results) =>{
            console.log(results)
            res.render('donorRQ', {request: results})
        })
    }catch(error){
        console.log(error)
    }
}

exports.searchrequestQ = (req,res) => {
    try{
        const {requestzip} = req.body
        console.log(requestzip)
        DB.query('SELECT * FROM request WHERE requestzip = ?', [requestzip], (error,results) =>{
            console.log(results)
            res.render('requestQ', {request: results})
        })
    }catch(error){
        console.log(error)
    }
}

exports.recepConnect = (req,res) => { //recipient accepting a pledge.
    try{
        const{id,Uid} =req.body
        console.log(Uid)
        console.log(id)
        DB.query('SELECT * FROM pledge WHERE id = ?', [id], (error,results) =>{
            DB.query('SELECT * FROM users WHERE id = ?',[Uid], (error,results2) =>{
                console.log(results2)
                res.render('confirmpledge', {pledge:results, user:results2})
            })
        })
    }catch(error){
        console.log(error)
    }
}

exports.acceptPledge = (req,res) => {
    try{
        const{id, Uid, user, pledge, type, item, quan, state, city, zipcode} = req.body
        DB.query('INSERT INTO r2dconnect SET?', {Uid: Uid, Did: id, UserName: user, title: pledge, type: type, item: item, quantity: quan, state: state, city: city, zipcode: zipcode}, (error,result)=> {
            if(error){
                console.log(error)
            }else{
                res.redirect('/recipient')
            }
        })
    }catch(error){
        console.log(error)
    }

}

exports.donorConnect = (req,res) => {
    try{
        const{id,Uid} = req.body
        console.log(Uid)
        console.log(id)
        DB.query('SELECT * FROM request WHERE id = ?', [id], (error,results) =>{
            DB.query('SELECT * FROM users WHERE id = ?',[Uid], (error,results2) =>{
                console.log(results)
                console.log(results2)
                res.render('confirmrequest', {request:results, user:results2})
            })
        })
    }catch(error){
        console.log(results)
    }
}

exports.acceptRequest = (req,res) => {
    try{
        const{id, Uid, user, request, type, item, quan, state, city, zipcode} = req.body
        console.log(id + Uid + user + request + type + item + quan + state + city + zipcode)
        DB.query('INSERT INTO d2rconnect SET?', {Uid: Uid, Did: id, UserName: user, title: request, type: type, item: item, quantity: quan, state: state, city: city, zipcode: zipcode}, (error,result) =>{
            if(error){
                console.log(error)
            }else{
                res.redirect('/donor')
            }
        })
    }catch(error){
        console.log(error)
    }
}

exports.pairR2D = (req,res) => {
    try{
        const{rid, Uid} = req.body
        console.log("HERE")
        console.log(rid + " " + Uid)
        DB.query('SELECT * FROM request WHERE id = ?', rid, (error,results) =>{
            DB.query('SELECT * FROM users WHERE id = ?', Uid, (error,results2) =>{
                DB.query('SELECT * FROM pledge WHERE usersid', (error,results3) =>{
                    if(error){
                        console.log(error)
                    }else{
                    res.render('pairR2D',{request: results, user: results2, pledge: results3})
                    }
                })
            })
        })
    }catch(error){
        console.log(error)
    }
}

exports.pairD2R = (req,res) => {
    try{
        const{Did,Uid} = req.body
        console.log(Did + " " + Uid)

       DB.query('SELECT * FROM pledge WHERE id = ?', Did, (error,results) =>{
           DB.query('SELECT * FROM users WHERE id = ?', Uid, (error,results2) =>{
               DB.query('SELECT * FROM request WHERE usersid', (error,results3) => {
                   console.log(results3)
                   if(error){
                       console.log(error)
                   }else{
                       res.render('pairD2R',{pledge: results, user: results2, request: results3})
                   }
               })
           })
       })
    }catch(error){
        console.log(error)
    }
}

exports.completeR2D = (req,res) => {
    const{rid, Uid, Did} = req.body
    console.log(rid)
    console.log(Uid)
    console.log(Did)

    DB.query('SELECT * FROM request where id = ?', rid, (errors,results) =>{
        DB.query('SELECT * FROM users WHERE Uid = ?', Uid, (error,results2) =>{
            DB.query('SELECT * FROM pledge WHERE id = ?', Did, (error,results3) =>{
                res.render('completeR2D', {request: results, user: results2, pledge: results3})
            })
        })
    })
}

exports.completeD2R = (req,res) => {
    
}

exports.confirmR2D = (req,res) =>{
    const {rid,id,Did,UserName,pledge,type,item,quantity,state,city,zipcode} = req.body
   console.log(rid)
   console.log(id)
    DB.query('INSERT INTO r2dconnect SET?', {Uid: rid, Did: Did, UserName: UserName, title: pledge, type: type, item: item, quantity: quantity, state: state, city: city, zipcode: zipcode}, (error,results) => {
            if(error){
                console.log(error)
            }else{
                res.redirect('/admin')
            }  
    })
}

