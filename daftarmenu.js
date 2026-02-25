/* ================= DHITO CAFE CENTRAL CONFIG ================= */
const IMG_PATH = "img/menu/";

function menuImg(file){
  return IMG_PATH + file;
}

/* ===== MENU MASTER ===== */
const MENU_DATA = [

/* ===== MAKANAN ===== */

{
nama:"Nasi Goreng",
harga:25000,
kategori:"makanan",
img:menuImg("nasigoreng.jpg"),
desc:"Nasi goreng spesial ayam dan telur.",
toppings:[
{nama:"Extra Keju",harga:5000},
{nama:"Telur Tambah",harga:6000},
{nama:"Sosis",harga:7000}
]
},

{
nama:"Ayam Geprek",
harga:28000,
kategori:"makanan",
img:menuImg("ayamgeprek.jpg"),
desc:"Ayam crispy dengan sambal khas.",
toppings:[
{nama:"Level Pedas +1",harga:0},
{nama:"Extra Keju",harga:5000}
]
},

/* ===== MINUMAN ===== */

{
nama:"Es Kopi",
harga:18000,
kategori:"minuman",
img:menuImg("eskopi.jpg"),
desc:"Cold brew creamy gula aren.",
toppings:[
{nama:"Extra Shot",harga:8000},
{nama:"Oat Milk",harga:6000},
{nama:"Whipped Cream",harga:4000}
]
},

{
nama:"Matcha Latte",
harga:24000,
kategori:"minuman",
img:menuImg("matcha.jpg"),
desc:"Matcha premium creamy.",
toppings:[
{nama:"Extra Matcha",harga:7000},
{nama:"Soy Milk",harga:5000}
]
},

/* ===== CEMILAN ===== */

{
nama:"Kentang",
harga:15000,
kategori:"cemilan",
img:menuImg("kentang.jpg"),
desc:"Kentang crispy.",
toppings:[
{nama:"Saus Keju",harga:4000},
{nama:"Saus BBQ",harga:4000},
{nama:"Mayonaise",harga:3000}
]
},

{
nama:"Onion Ring",
harga:17000,
kategori:"cemilan",
img:menuImg("onionring.jpg"),
desc:"Onion ring crispy golden.",
toppings:[]
},

/* ===== PROMO ===== */

{
nama:"Paket Hemat",
harga:45000,
kategori:"promo",
img:menuImg("pakethemat.jpg"),
desc:"Combo hemat nasi + minuman.",
toppings:[] // tidak bisa tambah topping
}

];

/* ===== GLOBAL SETTINGS ===== */
const APP_CONFIG = {
SERVICE_PERCENT: 0.05,
TAX_PERCENT: 0.10,
POINTS_PER_ORDER: 20,
STORE_NAME: "Dhito Cafe"
};