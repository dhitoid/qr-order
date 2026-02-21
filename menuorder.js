document.addEventListener("DOMContentLoaded", function(){
const island=document.getElementById("island");
const menuEl=document.getElementById("menu");
const sheet=document.getElementById("sheet");
const cartCount=document.getElementById("cartCount");
const modal=document.getElementById("menuModal");
const modalImg=document.getElementById("modalImg");
const modalTitle=document.getElementById("modalTitle");
const modalDesc=document.getElementById("modalDesc");
const modalPrice=document.getElementById("modalPrice");
const modalAddBtn=document.getElementById("modalAddBtn");

/* ================= AUTO FORMAT NO HP INDONESIA ================= */

const phoneInput = document.getElementById("phoneInput");

if(phoneInput){
phoneInput.addEventListener("input", function(e){

let value = e.target.value.replace(/\D/g,'');

/* ubah 08 -> 628 */
if(value.startsWith("0")){
value = "62" + value.substring(1);
}

/* max 13-14 digit */
value = value.substring(0,14);

let formatted = "";

if(value.length > 0){
formatted = "+" + value.substring(0,2);
}

if(value.length > 2){
formatted += " " + value.substring(2,5);
}

if(value.length > 5){
formatted += "-" + value.substring(5,9);
}

if(value.length > 9){
formatted += "-" + value.substring(9,13);
}

e.target.value = formatted;
});
}

function openMenuDetail(n){
let item=data.find(d=>d.nama===n);
selectedToppings=[];
modalQty=1;
document.getElementById("modalQty").innerText=modalQty;

modalImg.style.backgroundImage=`url('${item.img}')`;
modalTitle.innerText=item.nama;
modalDesc.innerText=item.desc;

renderToppings();
updatePrice(item);

modalAddBtn.onclick=()=>addToCartWithTopping(item);

modal.classList.add("show");
}

modal.addEventListener("click",(e)=>{
if(e.target===modal){
modal.classList.remove("show");
}
});

let cart=JSON.parse(localStorage.getItem("dhito_cart")||"[]");
let filter="all";
let selectedToppings=[];
let modalQty = 1;
let searchQuery="";
let orderHistory = JSON.parse(localStorage.getItem("order_history") || "[]");
/* ================= QRIS SIMULATION CLEAN ================= */

let qrisInterval = null;
let qrisTimeout = null;
let currentOrderData = null;

function startQris(total){

document.body.style.overflow="hidden";

let orderNo = generateOrderNumber();

/* simpan dulu data order sementara */
currentOrderData = {
id: orderNo,
date: new Date().toLocaleString(),
items: [...cart],
subtotal: total / 1.15,
service: total * 0.05,
tax: total * 0.10,
total: total
};

/* generate QR */
let qrData = `
DHITOCAFE
ORDER:${orderNo}
TOTAL:${total}
TIME:${Date.now()}
`;

let qrUrl =
"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="
+ encodeURIComponent(qrData);

document.getElementById("qrisImage").src = qrUrl;
document.getElementById("qrisTotal").innerText =
"Total: Rp " + total.toLocaleString();

document.getElementById("qrisModal").classList.add("show");

notify("📱 Silakan scan QRIS","info");

/* countdown */
let timeLeft = 60;
document.getElementById("qrisTimer").innerText = timeLeft;

qrisInterval = setInterval(()=>{
timeLeft--;
document.getElementById("qrisTimer").innerText = timeLeft;

if(timeLeft <= 0){
clearInterval(qrisInterval);
cancelQris(true);
}
},1000);

/* simulasi pembayaran berhasil */
qrisTimeout = setTimeout(()=>{
completeQrisPayment();
},7000 + Math.random()*5000);
}

function completeQrisPayment(){

clearInterval(qrisInterval);
clearTimeout(qrisTimeout);

document.getElementById("qrisModal").classList.remove("show");
document.body.style.overflow="auto";

/* simpan history */
orderHistory.unshift(currentOrderData);
localStorage.setItem("order_history",JSON.stringify(orderHistory));

points += 20;
localStorage.setItem("dhito_points",points);

updateLoyalty();
renderHistory();

checkoutProgress();

notify("💳 QRIS berhasil dibayar","success");

/* reset cart */
cart=[];
saveCart();
updateCart();
}

function cancelQris(expired=false){

clearInterval(qrisInterval);
clearTimeout(qrisTimeout);

document.getElementById("qrisModal").classList.remove("show");
document.body.style.overflow="auto";

if(expired){
notify("⏳ QRIS expired","warning");
}else{
notify("QRIS dibatalkan","info");
}
}

function checkoutSuccessAfterQR(){
checkoutProgress();
notify("💳 QRIS berhasil dibayar","success");
}

function downloadQris(){

let img = document.getElementById("qrisImage");

if(!img.src){
notify("QR belum siap","warning");
return;
}

let link = document.createElement("a");
link.href = img.src;
link.download = "QRIS_DhitoCafe.png";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

notify("📥 QR berhasil diunduh","success");
}

document.getElementById("searchInput")
.addEventListener("input",(e)=>{
searchQuery=e.target.value.toLowerCase();
render();
});

window.addEventListener("scroll",()=>{

let sections=document.querySelectorAll(".menu-section");

sections.forEach(sec=>{
let rect=sec.getBoundingClientRect();

if(rect.top<=150 && rect.bottom>=150){

let id=sec.id.replace("section-","");

document.querySelectorAll(".categories button")
.forEach(b=>b.classList.remove("active"));

document.querySelectorAll(".categories button")
.forEach(btn=>{
if(btn.innerText.toLowerCase().includes(id)){
btn.classList.add("active");
}
});

}
});

});

const toppingsData = [
{nama:"Extra Keju",harga:5000},
{nama:"Telur Tambah",harga:6000},
{nama:"Sosis",harga:7000},
{nama:"Extra Shot Kopi",harga:8000},
{nama:"Whipped Cream",harga:4000}
];

const data=[
{nama:"Nasi Goreng",harga:25000,kategori:"makanan",img:"https://source.unsplash.com/600x400/?friedrice",desc:"Nasi goreng spesial dengan ayam, telur, dan bumbu rahasia Dhito Cafe."},

{nama:"Es Kopi",harga:18000,kategori:"minuman",img:"https://source.unsplash.com/600x400/?coffee",desc:"Cold brew creamy dengan gula aren premium, segar dan nikmat."},

{nama:"Kentang",harga:15000,kategori:"cemilan",img:"https://source.unsplash.com/600x400/?fries",desc:"Kentang goreng crispy dengan saus spesial pilihan."},

{nama:"Paket Hemat",harga:45000,kategori:"promo",img:"https://source.unsplash.com/600x400/?foodcombo",desc:"Combo nasi + minuman favorit dengan harga lebih hemat."}
];

function renderToppings(){
let list=document.getElementById("toppingList");
list.innerHTML="";

toppingsData.forEach(t=>{
list.innerHTML+=`
<div class="topping-item"
onclick="toggleTopping('${t.nama}')">
${t.nama} (+Rp ${t.harga.toLocaleString()})
</div>`;
});
}

function toggleDropdown(e){
e.stopPropagation();
document.getElementById("categoryDropdown").classList.toggle("show");
}

function selectCategory(k){

filter=k;
render();

document.querySelectorAll(".categories button")
.forEach(b=>b.classList.remove("active"));

document.querySelector(".dropdown-btn").classList.add("active");

document.getElementById("categoryDropdown").classList.remove("show");

notify(`📂 Kategori: ${k.toUpperCase()}`,"info");

/* auto scroll ke menu */
document.getElementById("menu")
.scrollIntoView({behavior:"smooth"});
}

/* close dropdown jika klik luar */
document.addEventListener("click",()=>{
document.getElementById("categoryDropdown").classList.remove("show");
});

function toggleTopping(nama){
let index=selectedToppings.findIndex(t=>t.nama===nama);
let topping=toppingsData.find(t=>t.nama===nama);

if(index>-1){
selectedToppings.splice(index,1);
}else{
selectedToppings.push(topping);
}

updateActiveUI();
updatePrice(data.find(d=>d.nama===modalTitle.innerText));
}

function updateActiveUI(){
document.querySelectorAll(".topping-item").forEach(el=>{
let nama=el.innerText.split(" (+")[0];
if(selectedToppings.find(t=>t.nama===nama)){
el.classList.add("active");
}else{
el.classList.remove("active");
}
});
}

function updatePrice(item){
let total=item.harga;

selectedToppings.forEach(t=>total+=t.harga);

total*=modalQty;

modalPrice.innerText="Total Rp "+total.toLocaleString();
}

function addToCartWithTopping(item){

let toppingText=selectedToppings.map(t=>t.nama).join(", ");
let finalName=item.nama;
if(toppingText){
finalName+=` (${toppingText})`;
}

let basePrice=item.harga;
selectedToppings.forEach(t=>basePrice+=t.harga);

let existing=cart.find(c=>c.nama===finalName);

if(existing){
existing.qty+=modalQty;
}else{
cart.push({
nama:finalName,
harga:basePrice,
qty:modalQty
});
}

notify(`✅ ${finalName} (${modalQty}x)`,"success");

modal.classList.remove("show");
saveCart();
updateCart();
}

function increaseModal(){
modalQty++;
document.getElementById("modalQty").innerText=modalQty;
updatePrice(data.find(d=>d.nama===modalTitle.innerText));
}

function decreaseModal(){
if(modalQty>1){
modalQty--;
document.getElementById("modalQty").innerText=modalQty;
updatePrice(data.find(d=>d.nama===modalTitle.innerText));
}
}

function render(){

menuEl.innerHTML="";

let filtered=data.filter(d=>{
return (filter==="all"||d.kategori===filter) &&
(d.nama.toLowerCase().includes(searchQuery));
});

let grouped={};

filtered.forEach(item=>{
if(!grouped[item.kategori]) grouped[item.kategori]=[];
grouped[item.kategori].push(item);
});

Object.keys(grouped).forEach(kat=>{

menuEl.innerHTML+=`
<div class="menu-section" id="section-${kat}">
<h3 class="section-title">${kat.toUpperCase()}</h3>
<div class="menu-grid">
${grouped[kat].map(d=>`
<div class="card" onclick="openMenuDetail('${d.nama}')">
<img src="${d.img}">
<h4>${d.nama}</h4>
<div class="price">Rp ${d.harga.toLocaleString()}</div>
<button onclick="event.stopPropagation();openMenuDetail('${d.nama}')">
Tambah
</button>
</div>
`).join("")}
</div>
</div>
`;

});
}

function filterMenu(k,btn){
filter=k;
document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
render();
}

function setGreeting(){
let hour=new Date().getHours();
let greet="Selamat Datang";

if(hour<11) greet="Selamat Pagi ☀️";
else if(hour<15) greet="Selamat Siang 🌤";
else if(hour<18) greet="Selamat Sore 🌇";
else greet="Selamat Malam 🌙";

document.getElementById("greeting").innerText=greet+", Dhito";
}

setGreeting();

function checkoutProgress(){

island.classList.remove("success","danger","warning","info");
island.classList.add("expand","payment");

island.innerHTML=`
💳 Memproses Pembayaran
<div class="island-status" id="payStatus">
Menghubungi gateway...
</div>
<div class="island-progress">
<div class="island-progress-bar" id="progressBar"></div>
</div>
`;

let bar=document.getElementById("progressBar");
let status=document.getElementById("payStatus");

let steps=[
{w:20, text:"Menghubungi gateway..."},
{w:45, text:"Verifikasi keamanan 🔐"},
{w:70, text:"Menunggu konfirmasi bank..."},
{w:90, text:"Menyelesaikan transaksi..."},
{w:100, text:"Pembayaran berhasil ✅"}
];

let i=0;

let interval=setInterval(()=>{
bar.style.width=steps[i].w+"%";
status.innerText=steps[i].text;
i++;

if(i>=steps.length){
clearInterval(interval);

setTimeout(()=>{
island.classList.remove("payment");
island.classList.add("success");

let total=document.getElementById("total").innerText;

island.innerHTML=`
🎉 Pembayaran Sukses
<div class="island-status">${total}</div>
`;

confettiEffect();

setTimeout(()=>{
island.classList.remove("expand","success");
island.innerHTML="☕ Dhito Cafe";
},2500);

},700 + Math.random()*600);
}

},700 + Math.random()*600);
}

function add(n){
let item=cart.find(i=>i.nama===n);
if(item){
item.qty++;
notify(`🔄 ${n} (${item.qty}x)`,"info");
}else{
let d=data.find(x=>x.nama===n);
cart.push({...d,qty:1});
notify(`✅ ${n} ditambahkan`,"success");
}
saveCart();
updateCart();
}

function updateCart(){

let subtotal=0;

document.getElementById("cartItems").innerHTML=
cart.map((i,idx)=>{
subtotal+=i.harga*i.qty;

return `
<div class="cart-item">
<div class="cart-item-info"
onclick="editCartItem(${idx})">

<span class="cart-item-name">${i.nama}</span>
<span class="cart-item-price">
Rp ${(i.harga*i.qty).toLocaleString()}
</span>

</div>

<div class="qty-control">
<button onclick="event.stopPropagation();decrease(${idx})">−</button>
<span>${i.qty}</span>
<button onclick="event.stopPropagation();increase(${idx})">+</button>
</div>
</div>
`;
}).join("");

let service=subtotal*0.05;
let tax=subtotal*0.10;
let grand=subtotal+service+tax;

document.getElementById("subtotal").innerText="Rp "+subtotal.toLocaleString();
document.getElementById("service").innerText="Rp "+service.toLocaleString();
document.getElementById("tax").innerText="Rp "+tax.toLocaleString();
document.getElementById("grandTotal").innerText="Rp "+grand.toLocaleString();

cartCount.innerText=cart.reduce((a,b)=>a+b.qty,0);

}

function editCartItem(index){

let item=cart[index];

let baseName=item.nama.split(" (")[0];
let base=data.find(d=>d.nama===baseName);

selectedToppings=[];
modalQty=item.qty;

document.getElementById("modalQty").innerText=modalQty;

modalImg.style.backgroundImage=`url('${base.img}')`;
modalTitle.innerText=base.nama;
modalDesc.innerText=base.desc;

renderToppings();

/* restore topping */
let toppingText=item.nama.match(/\((.*?)\)/);
if(toppingText){
let toppingArr=toppingText[1].split(", ");
toppingArr.forEach(t=>{
let top=toppingsData.find(td=>td.nama===t);
if(top) selectedToppings.push(top);
});
}

updateActiveUI();
updatePrice(base);

modalAddBtn.innerText="Update Pesanan";

modalAddBtn.onclick=()=>{
updateCartItem(index,base);
};

modal.classList.add("show");
}

function updateCartItem(index,item){

let toppingText=selectedToppings.map(t=>t.nama).join(", ");
let finalName=item.nama;

if(toppingText){
finalName+=` (${toppingText})`;
}

let basePrice=item.harga;
selectedToppings.forEach(t=>basePrice+=t.harga);

cart[index]={
nama:finalName,
harga:basePrice,
qty:modalQty
};

modal.classList.remove("show");
modalAddBtn.innerText="Tambah ke Keranjang";

saveCart();
updateCart();

notify("✏️ Pesanan diperbarui","success");
}

function increase(i){
cart[i].qty++;
notify(`🔄 ${cart[i].nama} (${cart[i].qty}x)`,"info");
saveCart();
updateCart();
}

function decrease(i){
let name = cart[i].nama;
cart[i].qty--;

if(cart[i].qty<=0){
cart.splice(i,1);
notify(`❌ ${name} dihapus`,"danger");
}else{
notify(`🔄 ${name} (${cart[i].qty}x)`,"info");
}

saveCart();
updateCart();
}

function saveCart(){
localStorage.setItem("dhito_cart",JSON.stringify(cart));
}

function openSheet(){sheet.classList.add("show")}
function closeSheet(){sheet.classList.remove("show")}

/* CLOSE VIA HANDLE TAP */
document.querySelector(".handle").addEventListener("click",closeSheet);

/* SWIPE DOWN TO CLOSE */
let startY=0;
sheet.addEventListener("touchstart",e=>{
startY=e.touches[0].clientY;
});
sheet.addEventListener("touchmove",e=>{
let currentY=e.touches[0].clientY;
if(currentY-startY>120){
closeSheet();
}
});

function notify(text,type="info"){

island.classList.remove("success","info","danger","warning");
island.classList.add("expand",type);

island.style.opacity="0";
island.style.transform="translateX(-50%) scale(.8)";

setTimeout(()=>{
island.innerHTML=`${text}`;
island.style.opacity="1";
island.style.transform="translateX(-50%) scale(1.05)";
},120);

setTimeout(()=>{
island.classList.remove("expand",type);
island.innerHTML="☕ Dhito Cafe";
island.style.transform="translateX(-50%) scale(1)";
},2500);
}

let points=parseInt(localStorage.getItem("dhito_points")||0);

function updateLoyalty(){
let percent=(points%100);
document.getElementById("loyaltyFill").style.width=percent+"%";
}

function confettiEffect(){
for(let i=0;i<40;i++){
let conf=document.createElement("div");
conf.style.position="fixed";
conf.style.width="6px";
conf.style.height="6px";
conf.style.background="white";
conf.style.top="50%";
conf.style.left="50%";
conf.style.opacity="0.8";
conf.style.borderRadius="50%";
conf.style.zIndex="9999";
conf.style.transform=`translate(${Math.random()*300-150}px,${Math.random()*300-150}px)`;
document.body.appendChild(conf);
setTimeout(()=>conf.remove(),800);
}
}

function renderHistory(){

let container=document.getElementById("orderHistoryList");

if(orderHistory.length===0){
container.innerHTML="<p style='opacity:.5;font-size:13px;'>Belum ada pesanan.</p>";
return;
}

container.innerHTML=orderHistory.map(order=>{

let items=order.items.map(i=>
`${i.nama} (${i.qty}x)`
).join("<br>");

return `
<div class="history-card">

<div class="history-header">
<span class="history-id">${order.id}</span>
<span>${order.date}</span>
</div>

<div class="history-items">
${items}
</div>

<div class="history-total">
Total: Rp ${order.total.toLocaleString()}
</div>

</div>
`;

}).join("");

}

function generateOrderNumber(){

let now=new Date();

let date=
String(now.getDate()).padStart(2,'0')+
String(now.getMonth()+1).padStart(2,'0')+
String(now.getFullYear()).slice(-2);

let random=Math.floor(1000+Math.random()*9000);

return "#ORD-"+date+"-"+random;
}

function checkout(){

document.getElementById("qrisModal").classList.remove("show");

/* VALIDASI */
let inputs=document.querySelectorAll(".input");
for(let i of inputs){
if(!i.value){
notify("⚠️ Lengkapi data dulu","warning");
return;
}
}

if(cart.length===0){
notify("Keranjang kosong","danger");
return;
}

/* HITUNG TOTAL */
let subtotal=0;
cart.forEach(i=>{
subtotal+=i.harga*i.qty;
});

let service=subtotal*0.05;
let tax=subtotal*0.10;
let grand=subtotal+service+tax;

let method=document.querySelector("select").value;

/* ===== QRIS ===== */
if(method==="QRIS"){
closeSheet();
startQris(grand);
return;
}

/* ===== NON QRIS ===== */

let orderNo=generateOrderNumber();

let orderData={
id:orderNo,
date:new Date().toLocaleString(),
items:[...cart],
subtotal,
service,
tax,
total:grand
};

orderHistory.unshift(orderData);
localStorage.setItem("order_history",JSON.stringify(orderHistory));

points+=20;
localStorage.setItem("dhito_points",points);

updateLoyalty();
renderHistory();

closeSheet();
checkoutProgress();

notify("🎉 Order berhasil! "+orderNo,"success");

/* reset */
cart=[];
saveCart();
updateCart();
}

updateLoyalty();
updateCart();
renderHistory();
render();

});