// require("dotenv").config;
var express = require("express");
const bodyparser = require("body-parser");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var app = express();
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var jsonparser = bodyparser.json();

app.use(express.static(__dirname + "/public"));
var port = process.env.PORT || 3004;

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
var jwtsec = "ththbddecfgdgcbbxvdhhgfhdh";
function chectauth(req,res,next){
    try{
        // console.log(req.headers);
        var tok = req.headers && req.headers.authorization.split(" ")[1];
        // console.log(tok);
        const decoded = jwt.verify(tok, jwtsec);
        req.userData = decoded;
        next();
    }
    catch (error){
        res.status(401).json({
          message: "Auth failed",
        });
    }
}
var log = "";
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




app.get("/", (req,res)=>{
    visits("home")
    res.sendFile(path.join(__dirname, "/public/home.html"))
});
// app.get("/home", (req, res) => {
//     res.sendFile(path.join(__dirname, "/public/home.html"))
// });
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
app.get("/single/:type/:name/:price", (req, res) => {
    visits(req.params.name)
    res.sendFile(path.join(__dirname, "/public/single.html"));
});
app.post("/order/:data", jsonparser,(req,res)=>{
    var dat = req.params.data;
    var ord =JSON.parse(fs.readFileSync("./utils/order.json"));

    ord[dat].unshift(req.body);
    fs.writeFileSync("./utils/order.json", JSON.stringify(ord, null,2));
    res.status(200).json({
        message: "Thank you for your order, we are processing it right away"
    });
});

app.post("/contactus", jsonparser, (req, res) => {
    visits("contactus")
    var contact = JSON.parse(fs.readFileSync("./utils/contact1.json"));
    var data = {
                    name: req.body.name.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, ""),
                    phone: req.body.phone.replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, ""),
                    message: req.body.message.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, ""),
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
    console.log(req.body)
    var suggest = JSON.parse(fs.readFileSync("./utils/suggestion1.json"));
    var sug = "";
    suggest.unshift({
        message: req.body.message.trim().replace(/\</g, "").replace(/\>/g, "").replace(/\"/g, "").replace(/\'/g, ""),
        time: moment().format("MMMM Do,YYYY, h:mm a")
    });
    fs.writeFileSync("./utils/suggestion1.json", JSON.stringify(suggest, null, 2));
    res.status(200).json({
        message: "Thank you for your suggestion, We love you"
    });
});


// RANDOM
app.post(`/random`, chectauth , (req, res) => {
    // console.log(req.pathname);
//   console.log(req.headers);
  res.sendFile(path.join(__dirname, "/public/random/random.html"));
//   res.end();
  // log = "";
});
app.get(`/random`, (req, res) => {
    // console.log(req.pathname);
    //   console.log(req.headers);
    res.sendFile(path.join(__dirname, "/public/random/random.html"));
    //   res.end();
    // log = "";
});
// app.get(`/random/:data`, chectauth, (req, res) => {
//   // console.log(req.params.data)
// //   if (req.params.data == log) {
//     res.sendFile(path.join(__dirname, "/public/random/random.html"));
//     // log = "";
// //   } 
// //   else {
//     // res.status(400).json({
//     //   message: "error",
//     // });
// //   }
// });
app.get("/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/random/random-log.html"))
});

app.post("/check", jsonparser, (req,res)=>{
    // console.log(req.body);
    var pp = JSON.parse(fs.readFileSync("./pp.json"));
    var username = pp.filter((p)=>{
        return p.name === req.body.name
    });
    if(username.length > 0){
        if (username[0].name == req.body.name && username[0].password == req.body.password ){
            // log = Math.random();
            const token = jwt.sign({
              username: "admin",
              date: moment().format("MMMM Do,YYYY, h:mm a"),
            }, jwtsec,{
                expiresIn: "1hr"
            });
            res.status(200).sendFile(path.join(__dirname,"/public/random/random.html"))
            // json({
            //     message:`random/`,
            //     token
            // });
        }else{
            res.status(401).json({
                message: "Auth failed"
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


app.post("/contactt", jsonparser, (req,res)=>{
    var suggest = JSON.parse(fs.readFileSync("./utils/suggestion1.json"));
    var contact = JSON.parse(fs.readFileSync("./utils/contact1.json"));
    var data = {
        contact: contact,
        suggestion: suggest
    };
    res.status(200).json(data)
});

// NEW PRODUCT
app.post("/newproduct", upload.single("product"),(req,res)=>{
    var products = JSON.parse(fs.readFileSync("./utils/products.json"));
    
    var test = products[req.query.category].filter((prod)=>{
        return prod.name === req.query.name && prod.image === `/img/product/${req.file.originalname}` && prod.price == req.query.price
    });
    // console.log(test, req.query)
    if(test.length>0){
        res.json({
            message:"Product already exist"
        });
        // fs.unlinkSync(`/img/product/${req.file.originalname}`);
    
    }
    else{
        var data = {
            type: req.query.category,
            name: req.query.name,
            description: req.query.description,
            price: req.query.price,
            image: `/img/product/${req.file.originalname}`,
            id: products[req.query.category].length + 1
        }
        products[req.query.category].unshift(data);
        fs.writeFileSync("./utils/products.json", JSON.stringify(products, null, 2));
        res.status(200).json({
            message: "Product successfully uploaded"
        });
        
    }
});



app.post("/order", (req, res) => {
    res.sendFile(path.join(__dirname, "./utils/order.json"))
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
// xvcvbdgegg
app.post("/visit/:data", (req, res) => {

    var totalvisit =0;
    var totalsales =0;
    var totalrevenue =0;
    var totalorders = 0;
    var totaldelivered = 0;
    var cli =[];
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
                    phone: parseInt( data[hh[m]][j].phone)
                })
            }
        }
        // console.log(cli)
    }
    totalv(visit);
    totals(ord);
    totalr(ord);
    totalor(ord);
    loadclient(ord);
    var lh = remdup(cli);
    
    var data = {
        totalvisit, totalsales, totalrevenue, totalorders, totaldelivered, client: lh, visit
    }
    res.status(200).json(data)


res.end();
});

app.post("/products", (req, res) => {
    var products = JSON.parse(fs.readFileSync("./utils/products.json"));

    res.json(products);
});


app.listen(port);