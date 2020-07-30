var html = `

        <div class="nav-left">
            <img src="/img/nav/logo.png" alt="burger house| burger bread logo">
            Burger House
        </div>
        <div class="nav-right">
            <ul>
                <a href="/about">
                    <li class="shownot">About us</li>
                </a>
                <a href="/#contact">
                    <li class="shownot">Contact</li>
                </a>
                <a href="/cart">
                    <li class="shownot">Cart <span id="cartno"> 0</span></li>
                </a>
        <li id="mini-nav-menu" onclick="showminisidenav()"> <span></span> <span></span> <span></span> </li>
    
            </ul>
        </div>
    <div class="cover" id="cover2" onclick="showminisidenav()"></div>
`;
var nav = document.querySelector("nav");
nav.innerHTML = html;

var menuctn = `
            <a href="/">
               Home
            </a>
            <a href="/about">
                About us
            </a>
            <a href="/#contact">
                Contact
            </a>
            <a href="/cart" style="display: flex; justify-content: center;">
                Cart <span id="cartno2" style="padding: 0 4px; color:red;"> 0</span>
            </a>
            <a href="/#suggetion">
                suggestion
            </a>
`;
var menu = document.querySelector(".menu");
menu.innerHTML = menuctn;


var showminisidenav1 = 1;
function showminisidenav() {
    if (showminisidenav1 === 1) {
        document.querySelector(".menu").style.left = "calc(98vw - 160px) ";
        setTimeout(() => {
            document.getElementById("cover2").style.left = "0";
        }, 500);
        showminisidenav1 = 2;
    }
    else if (showminisidenav1 === 2) {
        document.querySelector(".menu").style.left = "-200vw";
        document.getElementById("cover2").style.left = "-200vw";
        showminisidenav1 = 1;
    }
}

if(window.location.pathname == "/"){
    document.querySelector("nav").style.backgroundColor = "#0a0a0a38";
    document.querySelector("nav").style.top = "5vh";
    document.querySelector("nav").style.width = "80vw";
    document.querySelector("nav").style.left = "10vw";
    document.querySelector("nav").style.color = "white";
    var span = document.querySelectorAll("#mini-nav-menu span");
    var hh = document.querySelectorAll("nav a");
    for(let i=0; i<hh.length; i++){
        hh[i].style.color = " white";
    }
    for (let i = 0; i < span.length; i++) {
        span[i].style.backgroundColor = " white";
    }
}

var scrolltot = document.createElement("div");
scrolltot.setAttribute("class", "to-top");
scrolltot.setAttribute("id", "scrollup");
scrolltot.innerHTML = `<span>&#8896;</span>`;

scrolltot.addEventListener("click", scrollup);


var body = document.querySelector("body");
body.appendChild(scrolltot);

window.onscroll = function () {
    scrollshow()
};

function scrollshow() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("scrollup").style.display = "flex";
    }
    else {
        document.getElementById("scrollup").style.display = "none";
    }
}

function scrollup() {
    document.documentElement.scrollBy(
        {
            top: `-${document.documentElement.scrollTop}`
        }
    );
}
var body = document.body;
var footer = document.createElement("footer");
var year = new Date().getFullYear();
var footerdiv = `
        <div class="footer-div">
            <div class="footer-left">
                <div class="footer-left-top">
                    <img src="/img/nav/logo.png" alt="burger house| burger bread logo">
                    BURGER HOUSE
                </div>
                <div class="footer-left-bottom">
                    Copyright &copy; ${year} All rights reserved |Burger house
                </div>
            </div>
            <div class="footer-middle">
                <ul>
                    <a href="/"><li>Home</li></a>
                    <a href="/#contact"><li>Contact</li></a>
                    <a href="/about"><li>About</li></a>
                    <a href="/cart"><li>Cart</li></a>
                </ul>
            </div>
            <div class="footer-right">
                <ul>
                    <a href="tel:08034289463"><li style="color: #FF5722;"><img src="/img/nav/phone.png" alt="burgerhouse phone number"></li></a>
                    <a href="https://wa.me/080***?text="><li><img src="/img/nav/whatsapp.png" alt="burgerhouse whatsapp"></li></a>
                    <a href="https://instagram.com/burgerHouse"><li><img src="/img/nav/instagram.png" alt="burgerhouse instagram"></li></a>
                    <a href="mailto:burgerhouse@yahoo.com"><li><img src="/img/nav/yahoo.png" alt="burgerhouse yahoo mail"></li></a>
            </div>
        </div>
        <div class="built">
            <p>built by <a href="https://instagram.com/ifo_tim">@ifo_tim</a> </p>
        </div>
   `
   footer.innerHTML = footerdiv;
   body.appendChild(footer);


function noincart() {
    var nobefore = parseInt(localStorage.getItem("noincart"));
    // console.log( nobefore);
    if (nobefore) {
        document.getElementById("cartno").innerHTML = nobefore;
        document.getElementById("cartno2").innerHTML = nobefore;
    }
    else {
        document.getElementById("cartno").innerHTML = 0;
        document.getElementById("cartno2").innerHTML = 0;
    }
}
noincart();