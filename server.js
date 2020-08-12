// require("dotenv").config;
var express = require("express");
const bodyparser = require("body-parser");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var session = require("express-session");
var app = express();
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var jsonparser = bodyparser.json();
var crypto = require("crypto");

app.use(express.static(__dirname + "/public"));
var port = process.env.PORT || 3004;
app.use(session({
    secret: "randomise it all",
    resave: true,
    saveUninitialized: false
}));

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "./public/img/product");
    },
    filename: function (req, res, cb) {

        // console.log(res, req.query)
        cb(null, res.originalname)
    }
});
const upload = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 30
    }
});
// var jwtsec = "ththbddecfgdgcbbxvdhhgfhdh";
// function chectauth(req,res,next){
//     try{
//         // console.log(req.headers);
//         var tok = req.headers && req.headers.authorization.split(" ")[1];
//         // console.log(tok);
//         const decoded = jwt.verify(tok, jwtsec);
//         req.userData = decoded;
//         next();
//     }
//     catch (error){
//         res.status(401).json({
//           message: "Auth failed",
//         });
//     }
// }

var objid = crypto.randomBytes(12).toString("base64").slice(0,12);
// console.log(objid)

function checkrole(req,res,next){
    if (req.session) {
      var pp = JSON.parse(fs.readFileSync("./pp.json"));
      var username = pp.filter((p) => {
        return p.name === req.session.userId;
      });
      if (username.length > 0) {
        if (username[0].role == "admin") {
          next();
        } else {
          res.json({message: "Unauthorised"});
        }
      } else {
        res.json({message: {message: "Unauthorised"}});
      }
    } else {
      res.json({message: "Unauthorised"});
    }
}
function authenticate(req,res,next){
    if (req.session) {
      var pp = JSON.parse(fs.readFileSync("./pp.json"));
      var username = pp.filter((p) => {
        return p.name === req.session.userId;
      });
      if (username.length > 0) {
          next();
      } else {
        res.json({message: "Unauthorised"});
      }
    } else {
      res.json({message: "Unauthorised"});
    }
}
var visit = JSON.parse(fs.readFileSync("./utils/visit.json"));

async function visits(page){
    var vv = 0;
    for(let v =0; v<visit.length; v++){
        if(visit[v].page == page){
            visit[v].visit += 1;
            fs.writeFileSync("./utils/visit.json", JSON.stringify(visit, null, 2));
            vv=1
        }
    }
    if (vv == 0) {
       visit.push({
           page, visit: 1
       });
        fs.writeFileSync("./utils/visit.json", JSON.stringify(visit, null, 2));
    }
}

String.prototype.escape = function(){
    var tagtoreplace = {
        "&":"&amp;",
        "<":"&lt",
        ">":"&gt",
        "script":" ",
        "Script":" ",
        '"':" ",
        "`":" "
    };
    return this.replace(/[&<>`]/g, function(tag){
        return tagtoreplace[tag] || tag;
    });
}


app.get("/", (req,res)=>{
    visits("home")
    res.sendFile(path.join(__dirname, "/public/home.html"))
});

app.get("/product/:data", (req, res) => {
    visits(req.params.data)
    res.sendFile(path.join(__dirname, "/public/products.html"));
});
app.get("/products", (req, res) => {
    var products = JSON.parse(fs.readFileSync("./utils/products.json"));

    res.json(products);
});
app.get("/cart", (req, res) => {
    visits("cart")
    res.sendFile(path.join(__dirname, "/public/cart.html"));
});
app.get("/about", (req, res) => {
  visits("about")
  res.sendFile(path.join(__dirname, "/public/about.html"));
});
app.get("/single/:type/:name/:price", (req, res) => {
    visits(req.params.name)
    res.sendFile(path.join(__dirname, "/public/single.html"));
});
app.post("/order/:data", jsonparser,(req,res)=>{
    var dat = req.params.data;
    var ord =JSON.parse(fs.readFileSync("./utils/order.json"));
    console.log(req.body);
    if (dat == "urgent") {
      var data = {
        name: req.body.name.escape(),
        phone: req.body.phone.escape(),
        location: req.body.location.escape(),
        deadline: req.body.deadline.escape(),
        id: ord[dat].length + 1,
        delivered:false,
        product: req.body.product,
        allproduct: req.body.allproduct,
      };
      ord["urgent"].unshift(data);
      fs.writeFileSync("./utils/order.json", JSON.stringify(ord, null, 2));
      res.status(200).json({
        message: "Thank you for your order, we are processing it right away",
      });
    }
    else if (dat == "normal") {
      var data = {
        name: req.body.name.escape(),
        phone: req.body.phone.escape(),
        location: req.body.location.escape(),
        addinfo: req.body.addinfo.escape(),
        id: ord[dat].length + 1,
        delivered: false,
        product: req.body.product,
        allproduct: req.body.allproduct,
      };
      ord["normal"].unshift(data);
      fs.writeFileSync("./utils/order.json", JSON.stringify(ord, null, 2));
      res.status(200).json({
        message: "Thank you for your order, we are processing it right away",
      });
    } 
    else if (dat == "booking") {
      var data = {
        name: req.body.name.escape(),
        phone: req.body.phone.escape(),
        location: req.body.location.escape(),
        request: req.body.request.escape(),
        id: ord[dat].length + 1,
        delivered: false,
        product: req.body.product,
        allproduct: req.body.allproduct,
      };
      ord["booking"].unshift(data);
      fs.writeFileSync("./utils/order.json", JSON.stringify(ord, null, 2));
      res.status(200).json({
        message: "Thank you for your order, we are processing it right away",
      });
    }
    else{
        res.status(501).json({
          message: "An error occured, pls resend order",
        });
    }
    
});

app.post("/contactus", jsonparser, (req, res) => {
    visits("contactus")
    var contact = JSON.parse(fs.readFileSync("./utils/contact1.json"));
    var data = {
                    name: req.body.name.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, "").escape(),
                    phone: req.body.phone.replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, "").escape(),
                    message: req.body.message.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, "").escape(),
                    time: moment().format("MMMM Do,YYYY, h:mm a")
                };

    

    contact.unshift(data);
    fs.writeFileSync("./utils/contact1.json", JSON.stringify(contact, null, 2));
    res.status(200).json({
        message: "Your message was successfully received, you are amazing"
    });
});

app.post("/suggestion", jsonparser, (req, res) => {
    visits("suggestion")
    // console.log(req.body)
    var suggest = JSON.parse(fs.readFileSync("./utils/suggestion1.json"));
    suggest.unshift({
        message: req.body.message.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, "").escape(),
        time: moment().format("MMMM Do,YYYY, h:mm a")
    });
    fs.writeFileSync("./utils/suggestion1.json", JSON.stringify(suggest, null, 2));
    res.status(200).json({
        message: "Thank you for your suggestion, We love you"
    });
});


// RANDOM
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/random/random-log.html"))
});
app.get("/logout", (req , res)=>{
    if(req.session){
        req.session.destroy(function(err){
          if (err) {
            return console.log(err);
          } else {
            res.redirect("/login");
          }
        });
    }
});

app.post("/check", urlencodedParser, (req,res)=>{
    // console.log(req.body);
    if(req.body.name && req.body.password){
        var pp = JSON.parse(fs.readFileSync("./pp.json"));
        var username = pp.filter((p) => {
          return p.name === req.body.name;
        });
        if (username.length > 0) {
          if (
            username[0].name == req.body.name &&
            username[0].password == req.body.password
          ) {
            req.session.userId = username[0].name;
            if (username[0].role == "admin") {
              res.redirect("/dashboard");
            } else {
              res.redirect("/general-dashboard");
            }
          } else {
            res.status(401).json({
              message: "Auth failed",
            });
          }
        } else {
          // alert("error")
          res.status(401).json({
            message: "Auth failed",
          });
        }
    }
    else{
        // alert("error")
        res.status(401).json({
            message:"Auth failed"
        })
    }
});

app.get("/dashboard",authenticate, checkrole, (req,res)=>{
    // console.log(req.session.userId)
    res.status(200).sendFile(path.join(__dirname, "/public/random/random.html"));
});
app.get("/general-dashboard", authenticate, (req, res) => {
//   console.log(req.session);
  res.status(200).sendFile(path.join(__dirname, "/public/random/order.html"));
});
app.post("/contactt", checkrole, jsonparser, (req, res) => {
  var suggest = JSON.parse(fs.readFileSync("./utils/suggestion1.json"));
  var contact = JSON.parse(fs.readFileSync("./utils/contact1.json"));
  var data = {
    contact: contact,
    suggestion: suggest,
  };
  res.status(200).json(data);
});

// NEW PRODUCT
app.post("/newproduct", checkrole, upload.single("product"), (req, res) => {
  var products = JSON.parse(fs.readFileSync("./utils/products.json"));

  var test = products[req.query.category].filter((prod) => {
    return (
      prod.name === req.query.name &&
      prod.image === `/img/product/${req.file.originalname}` &&
      prod.price == req.query.price
    );
  });
  // console.log(test, req.query)
  if (test.length > 0) {
    res.json({
      message: "Product already exist",
    });
    // fs.unlinkSync(`/img/product/${req.file.originalname}`);
  } else {
    var data = {
      type: req.query.category,
      name: req.query.name,
      description: req.query.description,
      price: req.query.price,
      image: `/img/product/${req.file.originalname}`,
      id: products[req.query.category].length + 1,
    };
    products[req.query.category].unshift(data);
    fs.writeFileSync(
      "./utils/products.json",
      JSON.stringify(products, null, 2)
    );
    res.status(200).json({
      message: "Product successfully uploaded",
    });
  }
});



app.post("/order", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "./utils/order.json"));
});
app.post("/delivered/:data", jsonparser, (req, res) => {
    var dat = req.params.data;
    var ord = JSON.parse(fs.readFileSync("./utils/order.json"));
    var h = 0;

    for (let i = 0; i < ord[req.body.section].length; i++){
        if (ord[req.body.section][i].id == req.body.id){
            ord[req.body.section][i].delivered = true;
            h=1;
        }
    }
    if(h==1){
        fs.writeFileSync("./utils/order.json", JSON.stringify(ord, null, 2));
        res.status(200).json({
            message: "done"
        });
    }
    else if(h == 0){
        res.status(500).json({
            message: "error"
        });
    }
    
});
function remdup(data) {
    var jb = data.map(JSON.stringify);
    var uniqset = new Set(jb);
    var ua = Array.from(uniqset).map(JSON.parse);
    return ua
}
function compare(a,b){
    const bana = a.incart;
    const banb = b.incart;
    let comp =0;
    if (bana > banb) {
      comp = -1;
    }
    else if (bana < banb) {
      comp = 1;
    }
    return comp
}
// xvcvbdgegg
app.post("/visit/:data",checkrole, (req, res) => {

    var totalvisit =0;
    var totalsales =0;
    var totalrevenue =0;
    var totalorders = 0;
    var totaldelivered = 0;
    var cli =[];
    var prodd = [];
    var prodd2 = [];
    var prodd3 = [];
    var ord = JSON.parse(fs.readFileSync("./utils/order.json"));
    function totalv(data){
        for(let i=0; i<data.length; i++){
            totalvisit += data[i].visit
        }
    }
    function totals(data){
        var hh=["urgent","normal","booking"];
        for(let m =0; m<hh.length; m++){
            for(let j=0; j<data[hh[m]].length; j++){
                if (data[hh[m]][j].delivered == true){
                    for (let k = 0; k < data[hh[m]][j].allproduct.length; k++){
                        // console.log(data[hh[m]][j].allproduct);
                        totalsales += data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].incart;
                        
                    }
                }
            }
        }
    }

    function totalr(data) {
        var hh = ["urgent", "normal", "booking"];
        for (let m = 0; m < hh.length; m++) {
            for (let j = 0; j < data[hh[m]].length; j++) {
                if (data[hh[m]][j].delivered == true) {
                    for (let k = 0; k < data[hh[m]][j].allproduct.length; k++) {
                        // console.log(data[hh[m]][j].allproduct);
                        totalrevenue += data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].incart * parseInt(data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].price);

                    }
                }
            }
        }
    }

    function totalor(data) {
        var hh = ["urgent", "normal", "booking"];
        for (let m = 0; m < hh.length; m++) {
            for (let j = 0; j < data[hh[m]].length; j++) {
                if (data[hh[m]][j].delivered == true) {
                        totaldelivered += 1;
                }
                    totalorders += 1;
            }
        }
    }
    
    function loadclient(data) {
        var hh = ["urgent", "normal", "booking"];
        for (let m = 0; m < hh.length; m++) {
            for (let j = 0; j < data[hh[m]].length; j++) {
                cli.push({
                    name: data[hh[m]][j].name.trim(),
                    phone: data[hh[m]][j].phone
                })
            }
        }
        // console.log(cli)
    }
    function getallproductorders(data) {
      var hh = ["urgent", "normal", "booking"];
      for (let m = 0; m < hh.length; m++) {
        for (let j = 0; j < data[hh[m]].length; j++) {
          if (data[hh[m]][j].delivered == true) {
            for (let k = 0; k < data[hh[m]][j].allproduct.length; k++) {
              prodd.push({
                product:
                  data[hh[m]][j].product[data[hh[m]][j].allproduct[k]]
                    .description.escape(),
                price:
                  data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].price.toString().escape(),
                image: data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].img.escape(),
                incart: parseInt(
                  data[hh[m]][j].product[data[hh[m]][j].allproduct[k]].incart
                ),
              });
            }
          }
        }
      }
      for (p = 0; p < prodd.length; p++) {
        var tt = prodd.filter((j) => {
          return (
            j.product == prodd[p].product &&
            j.price == prodd[p].price &&
            j.image == prodd[p].image
          );
        });
      
    //   console.log(tt);
        var thj = {
          product: tt[0].product,
          price: tt[0].price,
          image: tt[0].image,
          incart: 0,
        };
        for (let kl = 0; kl < tt.length; kl++) {
          thj.incart += tt[kl].incart;
          // console.log(thj)
        }
        prodd2.push(thj);
      }
      prodd3 = remdup(prodd2);
    //   console.log(prodd2)
      prodd3.sort(compare);
    }
    totalv(visit);
    totals(ord);
    totalr(ord);
    totalor(ord);
    getallproductorders(ord);
    loadclient(ord);
    var lh = remdup(cli);
    
    var data = {
        totalvisit, totalsales, totalrevenue, totalorders, totaldelivered, client: lh, visit,
        productorder: prodd3
    }

    res.status(200).json(data)


res.end();
});

app.post("/products",checkrole, (req, res) => {
    var products = JSON.parse(fs.readFileSync("./utils/products.json"));

    res.json(products);
});






app.listen(port);
