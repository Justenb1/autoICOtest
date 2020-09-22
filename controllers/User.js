const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs-extra');
require('dotenv').config();



// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// Load User model
const User = require("../models/User");
const Project = require("../models/Project");


//Function create folder for an user

function createUserFolder (userName){
  
  const folder = "./projects/" + userName ; 
  fs.mkdirp(folder, err => {
    if (err){ 
      return console.error(err) }
    console.log('success!');
    return true;
  })

};


//Controller for user register
exports.UserRegister = function (req, res) {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then( () => {
              createUserFolder(newUser.name) //ADD CONTROL ERROR HERE
              res.sendStatus(200)}
              )
            .catch(err => console.log(err));
        });
      });
    }
  });
};


//Controller for user login
exports.UserLogin = function (req, res) {
    // Form validation
  
    const { errors, isValid } = validateLoginInput(req.body);
  
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const email = req.body.email;
    const password = req.body.password;
  
    // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
          const secret = process.env.SECRET;
  
          // Sign token
          const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
          });
          res.cookie('token', token, { httpOnly: true })
            .sendStatus(200);
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
};


//Controller for user logout
exports.UserLogout = function (req, res) {
  const token = 
  req.body.token ||
  req.query.token ||
  req.headers['x-access-token'] ||
  req.cookies.token;

  const secret = process.env.SECRET;  
  
  if (!token) {
  res.status(401).send('Unauthorized: No token provided');
  } else {
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      req.email = decoded.email;
      //console.log(decoded);
     //res.status(200);
      res.clearCookie('token',{httpOnly: true}).sendStatus(200);
    }
  });
  };
}


//Controller for get user projects
exports.UserProjects = function (req,res) {
  const token = 
  req.body.token ||
  req.query.token ||
  req.headers['x-access-token'] ||
  req.cookies.token;

  const secret = process.env.SECRET;  
  
  if (!token) {
  res.status(401).send('Unauthorized: No token provided');
  } else {
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      User.findById(decoded.id).populate('projects').exec(function (err, UserAndProjects) {
        if (err) return console.log(err);
        //console.log(UserAndProjects.projects);

        res.status(200).json(UserAndProjects.projects);
      });
    }
  });
  };
}