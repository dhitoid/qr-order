const urlParams = new URLSearchParams(window.location.search);
let table = urlParams.get("table") || "01";
document.getElementById("tableInfo").innerText = "Meja " + table;

let menu = [
{ id:1, name:"Nasi Goreng Special", price:25000, img:"https://source.unsplash.com/400x300/?fried-rice"},
{ id:2, name:"Ayam Bakar Madu", price:30000, img:"https://source.unsplash.com/400x300/?grilled-chicken"},
{ id:3, name:"Mie Goreng Seafood", price:28000, img:"https://source.unsplash.com/400x300/?noodles"},
{ id:4, name:"Es Kopi Susu", price:18000, img:"https://source.unsplash.com/400x300/?iced-coffee"}
];

let cart = [];

const menuList = document.getElementById("menuList");

menu.forEach(item=>{
menuList.innerHTML += `
<div class="menu-card">
<img src="${item.img}">
<div class="menu-content">
<h3>${item.name}</h3>
<p class="price">Rp ${item.price.toLocaleString()}</p>
<div class="qty-control">
<button onclick="add(${item.id})">+</button>
</div>
</div>
</div>
`;
});

function add(id){
let item = menu.find(m=>m.id===id);
let exist = cart.find(c=>c.id===id);

if(exist){
exist.qty++;
}else{
cart.push({...item, qty:1});
}

updateCart();
}

function updateCart(){
document.getElementById("cartCount").innerText =
cart.reduce((a,b)=>a+b.qty,0);

let cartItems = document.getElementById("cartItems");
cartItems.innerHTML = "";

let subtotal = 0;

cart.forEach(item=>{
subtotal += item.price * item.qty;
cartItems.innerHTML += `
<p>${item.name} x${item.qty} - Rp ${(item.price*item.qty).toLocaleString()}</p>
`;
});

let tax = subtotal*0.1;
let service = subtotal*0.05;
let total = subtotal+tax+service;

document.getElementById("subtotal").innerText="Rp "+subtotal.toLocaleString();
document.getElementById("tax").innerText="Rp "+tax.toLocaleString();
document.getElementById("service").innerText="Rp "+service.toLocaleString();
document.getElementById("total").innerText="Rp "+total.toLocaleString();
}

function openCart(){
document.getElementById("cartModal").classList.add("active");
}

function closeCart(){
document.getElementById("cartModal").classList.remove("active");
}

function checkout(method){
if(cart.length===0){
alert("Keranjang kosong!");
return;
}
alert("Pesanan berhasil!\nMetode: "+method);
cart=[];
updateCart();
closeCart();
}