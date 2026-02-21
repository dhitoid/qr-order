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

async function downloadInvoicePDF(){

const { jsPDF } = window.jspdf;

let invoice=document.getElementById("invoicePrintable");

let canvas=await html2canvas(invoice,{
scale:2,
backgroundColor:null
});

let imgData=canvas.toDataURL("image/png");

let pdf=new jsPDF("p","mm","a4");

let imgWidth=190;
let pageHeight=297;
let imgHeight=canvas.height*imgWidth/canvas.width;

pdf.addImage(imgData,"PNG",10,10,imgWidth,imgHeight);

pdf.save("Invoice_DhitoCafe.pdf");

}

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
let paymentLock = false;
let showAllHistory = false;
let orderHistory = JSON.parse(localStorage.getItem("order_history") || "[]");
let modalStartY=0;
let lastScroll = 0;
let islandForceShow = false;
let islandHidden = false;

window.addEventListener("scroll", ()=>{

let currentScroll = window.scrollY;
let delta = currentScroll - lastScroll;

/* 🚨 JANGAN HIDE kalau force show */
if(islandForceShow){
lastScroll = currentScroll;
return;
}

/* Jangan ganggu saat expand */
if(island.classList.contains("expand")){
lastScroll = currentScroll;
return;
}

/* SCROLL TURUN */
if(delta > 5 && currentScroll > 80){
island.style.transform = "translate(-50%,-80px)";
island.style.opacity = "0";
}

/* SCROLL NAIK */
if(delta < -5){
island.style.transform = "translate(-50%,0)";
island.style.opacity = "1";
}

/* SHRINK */
if(currentScroll > 40){
island.classList.add("mini");
}else{
island.classList.remove("mini");
}

lastScroll = currentScroll;

});

/* ================= QRIS PROFESSIONAL FIXED ================= */

let qrisInterval=null;
let qrisTimeout=null;
let currentOrderData=null;
let qrisStatus="idle";

function startQris(total){

if(qrisStatus==="waiting") return;

qrisStatus="waiting";

let modal=document.getElementById("qrisModal");
let img=document.getElementById("qrisImage");
let loading=document.getElementById("qrisLoading");
let overlay=document.getElementById("qrisOverlayStatus");
let timerText=document.getElementById("qrisTimer");
let successAnim=document.getElementById("successAnim");

/* SHOW MODAL */
modal.classList.add("show");
document.body.style.overflow="hidden";

/* RESET UI */
img.style.display="none";
img.style.opacity="1";
loading.style.display="flex";
successAnim.style.display="none";

overlay.innerText="Menghasilkan QR...";
overlay.style.background="rgba(0,0,0,0.7)";

timerText.innerText="180";

/* GENERATE QR */
let orderNo = currentOrderData.id;
let qrData=`DHITOCAFE|${orderNo}|${total}|${Date.now()}`;
let qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="+encodeURIComponent(qrData);

img.onload=function(){
if(qrisStatus!=="waiting") return;
loading.style.display="none";
img.style.display="block";
overlay.innerText="Menunggu Pembayaran";
};

img.src=qrUrl;

/* TIMER 3 MENIT */
let endTime=Date.now()+180000;

qrisInterval=setInterval(()=>{
let remaining=Math.max(0,Math.floor((endTime-Date.now())/1000));
timerText.innerText=remaining;

if(remaining<=0) expireQris();
},1000);

/* FAKE SUCCESS (8 DETIK) */
qrisTimeout=setTimeout(()=>{
if(qrisStatus==="waiting"){
completeQrisPayment();
}
},8000);

}

/* ================= COMPLETE ================= */

function completeQrisPayment(){

if(qrisStatus!=="waiting") return;

qrisStatus="paid";

clearInterval(qrisInterval);
clearTimeout(qrisTimeout);

let overlay=document.getElementById("qrisOverlayStatus");
let successAnim=document.getElementById("successAnim");
let img=document.getElementById("qrisImage");

overlay.innerText="Pembayaran diterima";
overlay.style.background="rgba(76,175,80,0.9)";
img.style.opacity="0.3";

setTimeout(()=>{
successAnim.style.display="flex";
},300);

setTimeout(()=>{

currentOrderData.paymentStatus="Lunas";
currentOrderData.orderStatus="Sedang Disiapkan";

closeQrisModal();

/* ISLAND ANIMATION */
checkoutProgress();

/* FINALIZE */
setTimeout(()=>{
finalizePayment();

/* AUTO BUKA INVOICE TERBARU */
openInvoice(0);

},2500);

},1500);

}

/* ================= EXPIRE ================= */

function expireQris(){

if(qrisStatus!=="waiting") return;

qrisStatus="expired";

clearInterval(qrisInterval);
clearTimeout(qrisTimeout);

let overlay=document.getElementById("qrisOverlayStatus");
overlay.innerText="QR Kadaluarsa";
overlay.style.background="rgba(255,82,82,0.9)";

setTimeout(()=>{
closeQrisModal();
},1500);

paymentLock = false;
setCheckoutLoading(false);
}

/* ================= CANCEL ================= */

function cancelQris(){

if(qrisStatus!=="waiting") return;

qrisStatus="cancelled";

clearInterval(qrisInterval);
clearTimeout(qrisTimeout);
closeQrisModal();

paymentLock = false;
setCheckoutLoading(false);
}

/* ================= CLOSE ================= */

function closeQrisModal(){
document.getElementById("qrisModal").classList.remove("show");
document.body.style.overflow="auto";
qrisStatus="idle";
}

/* ================= FINAL ORDER ================= */

function finalizePayment(){
orderHistory.unshift(currentOrderData);
localStorage.setItem("order_history",JSON.stringify(orderHistory));

points+=20;
localStorage.setItem("dhito_points",points);

updateLoyalty();
renderHistory();

cart=[];
saveCart();
updateCart();

notify("🎉 Order berhasil! "+currentOrderData.id,"success");

paymentLock = false;
setCheckoutLoading(false);
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

function openInvoice(index){

let order=orderHistory[index];

let badgeClass = order.paymentStatus==="Lunas"
? "badge-success"
: "badge-warning";

let qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data="+encodeURIComponent(order.id);

let itemsHTML=order.items.map(i=>
`<div class="invoice-item">
<span>${i.nama} (${i.qty}x)</span>
<span>Rp ${(i.harga*i.qty).toLocaleString()}</span>
</div>`
).join("");

document.getElementById("invoiceBody").innerHTML=`

<div id="invoicePrintable">

<div class="invoice-header">
<div>
<div class="invoice-id">${order.id}</div>
<div style="font-size:12px;opacity:.6">${order.date}</div>
</div>

<img src="${qrUrl}" class="invoice-qr-small">
</div>

<div style="font-size:13px;opacity:.85;margin-bottom:10px;">
<strong>Nama:</strong> ${order.customerName || "-"}<br>
<strong>No HP:</strong> ${order.customerPhone || "-"}
</div>

<div class="invoice-divider"></div>

${itemsHTML}

<div class="invoice-divider"></div>

<div class="invoice-item">
<span>Subtotal</span>
<span>Rp ${order.subtotal.toLocaleString()}</span>
</div>

<div class="invoice-item">
<span>Service</span>
<span>Rp ${order.service.toLocaleString()}</span>
</div>

<div class="invoice-item">
<span>Pajak</span>
<span>Rp ${order.tax.toLocaleString()}</span>
</div>

<div class="invoice-divider"></div>

<div class="invoice-total-big">
Rp ${order.total.toLocaleString()}
</div>

<div style="margin-top:12px;">
Metode: ${order.paymentMethod}<br>
<span class="invoice-badge ${badgeClass}">
${order.paymentStatus}
</span><br>
Status: ${order.orderStatus}
</div>

</div>
`;

document.getElementById("invoiceModal").classList.add("show");
}

function closeInvoice(){
document.getElementById("invoiceModal").classList.remove("show");
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

islandForceShow = true;
island.style.transform = "translate(-50%,0)";
island.style.opacity = "1";

island.classList.remove("success","danger","warning","info");
island.classList.add("expand","payment");

island.innerHTML=`
💳 Memproses Pembayaran
<div class="island-status" id="payStatus">
Menghubungi gateway...
</div>

<div class="bank-verify">
<div class="bank-dot"></div>
<div class="bank-dot"></div>
<div class="bank-dot"></div>
<span id="bankText">Verifikasi bank...</span>
</div>

<div class="island-progress">
<div class="island-progress-bar" id="progressBar"></div>
</div>
`;

let bar=document.getElementById("progressBar");
let status=document.getElementById("payStatus");
let bankText=document.getElementById("bankText");

let steps=[
{w:25, text:"Menghubungi gateway...", bank:"Mengirim request ke bank..."},
{w:50, text:"Verifikasi keamanan 🔐", bank:"Validasi OTP & Signature..."},
{w:75, text:"Menunggu konfirmasi bank...", bank:"Menunggu respon bank..."},
{w:95, text:"Menyelesaikan transaksi...", bank:"Settlement transaksi..."},
{w:100, text:"Pembayaran berhasil ✅", bank:"Dana diterima ✔"}
];

let i=0;

let interval=setInterval(()=>{

bar.style.width=steps[i].w+"%";
status.innerText=steps[i].text;
bankText.innerText=steps[i].bank;

i++;

if(i>=steps.length){
clearInterval(interval);

setTimeout(()=>{

island.classList.remove("payment");
island.classList.add("success");

island.innerHTML=`
🎉 Pembayaran Sukses
<div class="island-status">
${currentOrderData.total
? "Rp "+currentOrderData.total.toLocaleString()
: ""}
</div>
`;

confettiEffect();

setTimeout(()=>{
island.classList.remove("expand","success");
island.innerHTML="☕ Dhito Cafe";
},2500);

},900);
}

},800);
islandForceShow = false;
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

islandForceShow = true;
island.style.transform = "translate(-50%,0)";
island.style.opacity = "1";

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
islandForceShow = false;
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

function toggleHistoryView(){
showAllHistory = !showAllHistory;
renderHistory();
}

function renderHistory(){

let container=document.getElementById("orderHistoryList");

if(orderHistory.length===0){
container.innerHTML="<p style='opacity:.5;font-size:13px;'>Belum ada pesanan.</p>";
return;
}

let displayData = showAllHistory 
? orderHistory 
: orderHistory.slice(0,3);

container.innerHTML = displayData.map(order=>{

let items=order.items.map(i=>
`${i.nama} (${i.qty}x)`
).join("<br>");

return `
<div class="history-card" onclick="openInvoice(${orderHistory.indexOf(order)})">

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

/* ===== BUTTON TOGGLE ===== */

if(orderHistory.length > 3){
container.innerHTML += `
<div class="history-toggle">
<button onclick="toggleHistoryView()">
${showAllHistory ? "Lihat Lebih Sedikit" : "Lihat Semua"}
</button>
</div>
`;
}

}

function closeMenuModal(){
modal.classList.remove("show");
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

function completePaymentDirect(){
checkoutProgress();
setTimeout(()=>{
finalizePayment();
},3000);
}

function setCheckoutLoading(state){

let btn=document.querySelector(".checkout-btn");

if(!btn) return;

if(state){
btn.classList.add("loading");
btn.innerText="Memproses...";
}else{
btn.classList.remove("loading");
btn.innerText="Checkout";
}
}

function checkout(){

if(paymentLock) return;

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

paymentLock = true;
setCheckoutLoading(true);

/* HITUNG TOTAL */
let subtotal=0;
cart.forEach(i=>{
subtotal+=i.harga*i.qty;
});

let service=subtotal*0.05;
let tax=subtotal*0.10;
let grand=subtotal+service+tax;

let method=document.getElementById("paymentMethod").value;
let name=document.querySelectorAll(".input")[0].value;
let phone=document.getElementById("phoneInput").value;

if(!method){
notify("Pilih metode pembayaran","warning");
paymentLock = false;
setCheckoutLoading(false);
return;
}

currentOrderData={
id:generateOrderNumber(),
date:new Date().toLocaleString(),
items:[...cart],
subtotal,
service,
tax,
total:grand,
paymentMethod:method,
paymentStatus: method==="QRIS" ? "Menunggu Pembayaran" : "Belum Dibayar",
orderStatus: "Diproses",
customerName:name,
customerPhone:phone
};

/* ================= MINI PROCESSING UI ================= */

islandForceShow = true;
island.classList.add("expand","payment");
island.innerHTML=`
💳 Memverifikasi Data
<div class="island-status">
Menyiapkan transaksi...
</div>
`;

/* Delay singkat saja */
setTimeout(()=>{

/* ===== QRIS FLOW ===== */
if(method==="QRIS"){

closeSheet();
startQris(grand);

island.classList.remove("expand","payment");
island.innerHTML="☕ Dhito Cafe";
islandForceShow = false;

return; // jangan finalize di sini
}

/* ===== BAYAR DI KASIR ===== */

if(method==="KASIR"){

closeSheet();

currentOrderData.paymentStatus="Belum Dibayar";
currentOrderData.orderStatus="Menunggu Pembayaran di Kasir";

checkoutProgress();

setTimeout(()=>{
finalizePayment();
openInvoice(0); // langsung buka invoice terbaru
},2000);

return;
}

},900);
}

/* ================= INIT ================= */

updateLoyalty();
updateCart();
renderHistory();
render();

/* ================= EXPOSE GLOBAL FUNCTIONS ================= */

window.openInvoice = openInvoice;
window.closeInvoice = closeInvoice;
window.toggleHistoryView = toggleHistoryView;
window.openMenuDetail = openMenuDetail;
window.toggleTopping = toggleTopping;
window.increaseModal = increaseModal;
window.decreaseModal = decreaseModal;
window.filterMenu = filterMenu;
window.selectCategory = selectCategory;
window.toggleDropdown = toggleDropdown;
window.add = add;
window.increase = increase;
window.decrease = decrease;
window.editCartItem = editCartItem;
window.openSheet = openSheet;
window.closeSheet = closeSheet;
window.checkout = checkout;
window.startQris = startQris;
window.cancelQris = cancelQris;
window.downloadQris = downloadQris;
});