const urlParams = new URLSearchParams(window.location.search);
let table = urlParams.get("table") || "01";
document.getElementById("tableInfo").innerText = "Meja " + table;

let menu = [
  {id:1,name:"Nasi Goreng",price:20000},
  {id:2,name:"Mie Ayam",price:15000},
  {id:3,name:"Es Teh",price:5000},
  {id:4,name:"Ayam Bakar",price:25000}
];

let cart = [];

const menuList = document.getElementById("menuList");

menu.forEach(item=>{
  menuList.innerHTML += `
    <div class="menu-card">
      <h3>${item.name}</h3>
      <p>Rp ${item.price.toLocaleString()}</p>
      <button onclick="addToCart(${item.id})">
        Tambah
      </button>
    </div>
  `;
});

function addToCart(id){
  let item = menu.find(m=>m.id===id);
  cart.push(item);
  updateCart();
}

function updateCart(){
  document.getElementById("cartCount").innerText = cart.length;

  let cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach(item=>{
    total += item.price;
    cartItems.innerHTML += `
      <p>${item.name} - Rp ${item.price.toLocaleString()}</p>
    `;
  });

  document.getElementById("totalPrice").innerText =
    total.toLocaleString();
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

  let order = {
    table:table,
    items:cart,
    method:method,
    date:new Date()
  };

  let orders = JSON.parse(localStorage.getItem("orders")||"[]");
  orders.push(order);
  localStorage.setItem("orders",JSON.stringify(orders));

  alert("Pesanan berhasil dikirim!\nMetode: "+method);
  cart=[];
  updateCart();
  closeCart();
}