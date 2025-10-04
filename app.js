let items = []; //global array for inventory

function addItem(){
  let code = document.getElementById("itemCode").value;
  let name = document.getElementById("itemName").value;
  let qty = parseInt(document.getElementById("quantity").value);
  let price = parseFloat(document.getElementById("price").value);

  //validate form inputs
  if (!code ||!name){
    alert("please fill all fields");
    return;
  }

  if(isNaN(qty) || isNaN(price)){
    alert("please enter a valid input")
    return;
  }

  //prevent duplicate codes
  let existing = items.find(item => item.itemCode === code);
  if (existing) {
    alert("item code already exists use update instead");
    return;
  }

  //item object
  let itemObj = { itemCode: code, itemName: name, quantity: qty, price: price };
  items.push(itemObj);

  console.log("added:", itemObj);
  updateSum();
  renderList();
  document.getElementById("itemForm").reset();
}

function updateItemFromForm(){
  let code = document.getElementById("itemCode").value;
  let name = document.getElementById("itemName").value;
  let qty = parseInt(document.getElementById("quantity").value);
  let price = parseFloat(document.getElementById("price").value);

  let item = items.find(i => i.itemCode === code);

  if (item) {
    if (name) item.itemName = name;
    if (!isNaN(qty)) item.quantity = qty;
    if (!isNaN(price)) item.price = price;

    console.log("updated:", item);
    updateSum();
    renderList();
    document.getElementById("itemForm").reset();
  } else {
    alert("item not found");
  }
}

function updateSum(itemArr = items){
  let totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  let totalVal = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);

  document.getElementById("summary").innerHTML = items.length > 0
  ? ("Inventory Summary:<br>Total Unique Items: " + items.length + "<br>Total Stock Quantity: "
  + totalQty + "<br>Total Inventory Value: PHP " + totalVal.toFixed(2) + ""): "No inventory data yet";
}


function deleteItem(code){
  if (confirm("are you sure you want to delete item " + code + "?")) {
    items = items.filter(i => i.itemCode !== code);
    console.log("deleted:", code);
    updateSum();
    renderList();
  }
}

function filterItems(){
  //show only items with stock less than 10
  let filtered = items.filter(i => i.quantity < 10);
  console.log("filtered:", filtered);
  renderList(filtered);
}

let sortNameAsc = true;
let sortPriceAsc = true;

function sortByName(){
  items.sort((a, b) =>
    sortNameAsc ? a.itemName.localeCompare(b.itemName) : b.itemName.localeCompare(a.itemName)
  );
  sortNameAsc = !sortNameAsc;
  console.log("sorted by name:", items);
  renderList();
}

function sortByPrice(){
  items.sort((a, b) =>
    (sortPriceAsc) ? (a.price - b.price) : (b.price - a.price)
  );
  sortPriceAsc = !sortPriceAsc;
  console.log("sorted by price:", items);
  renderList();
}

function resetList(){
  document.getElementById("searchBox").value = "";
  renderList(items);
}

function searchItems(keyword){
  //allow partial keyword matches
  keyword = keyword.toLowerCase();
  let results = items.filter(i =>
    i.itemName.toLowerCase().includes(keyword)||
    i.itemCode.toLowerCase().includes(keyword)
  );
  console.log("search results:", results);
  renderList(results);
}

let tableView = true;

function toggleView(){
  let listDiv = document.getElementById("list");
  if (listDiv.dataset.view === "table") {
    //switch to card view
    listDiv.innerHTML = items.map(i => `
      <div style="border:1px solid black; margin:5px; padding:5px;">
        <strong>${i.itemName}</strong> (${i.itemCode})<br>
        qty: ${i.quantity}<br>
        price: php ${i.price}<br>
        <button onclick="deleteItem('${i.itemCode}')">delete</button>
      </div>
    `).join("");
    listDiv.dataset.view = "card";
  } else {
    renderList(items);
    listDiv.dataset.view = "table";
  }
}

function renderList(arr = items) {
  let output = "";

  if (arr.length === 0) {
    output = `<tr><td colspan="5" style="text-align:center; color:gray;">no items in inventory</td></tr>`;
  } else {
    arr.forEach(i => {
      //highlight zero stock in red
      let style = i.quantity === 0 ? " style='color:red;'" : "";
      output += `<tr${style}><td>${i.itemCode}</td><td>${i.itemName}</td>
                 <td>${i.quantity}</td><td>${i.price}</td>
                 <td><button onclick="deleteItem('${i.itemCode}')">delete</button></td>
                 </tr>`;
    });
  }

  document.getElementById("list").innerHTML = output;

  //update total quantity and value
  let totalQty = arr.reduce((sum, i) => sum + i.quantity, 0);
  let totalVal = arr.reduce((sum, i) => sum + (i.quantity * i.price), 0);

  document.getElementById("summary").innerHTML=arr.length > 0
      ? "total items: " + arr.length + "<br>total quantity: " + totalQty + "<br>total value: PHP " + totalVal
      : "no inventory data yet";
}

//cart object handles shopping cart logic
let cart = {
  items: [],

  add: function(itemObj, qty){
    //reject if buying more than stock
    if (qty > itemObj.quantity){
      return "not enough stock";
    }
    this.items.push({ name: itemObj.itemName, qty: qty, price: itemObj.price });
    itemObj.quantity -= qty;
    return itemObj.itemName + " added to cart";
  },

  checkout: function(){
    //compute total, tax, and discount
    let total = this.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    let tax = total * 0.12;
    let subtotalWithTax = total+tax;
    let discountApplied = 0;
    let final = total + tax;

    if (final > 5000){
      discountApplied = final * 0.1;
      final -= discountApplied;
    }

    return `Checkout Report (Items: ${this.items.length}):<br>
    Subtotal: PHP ${total.toFixed(2)}<br>
    Tax (12%): PHP ${tax.toFixed(2)}<br>
    Total w/ Tax: PHP ${subtotalWithTax.toFixed(2)}<br>
    Discount Applied: PHP ${discountApplied.toFixed(2)}<br>
    Final Amount Due: PHP ${final.toFixed(2)}`;
  }
};

function addToCartFromForm(){
  //gets values from the form inputs
  let code = document.getElementById("cartItemCode").value;
  let qty = parseInt(document.getElementById("cartQuantity").value);

  //check if the output is valid
  if (!code || isNaN(qty) || qty <= 0){
    alert("Please enter a valid item code and quantity.");
    return;
  }

  //we use .find() to locate the item object that matches the code.
  let product = items.find(i => i.itemCode === code);

  if (!product) {
    alert("Item code not found in inventory.");
    return;
  }

  let msg = cart.add(product, qty);

  console.log(msg);
  document.getElementById("cartOutput").innerHTML = msg;
  
  renderList(); 
}

function showCheckout(){
  let report = cart.checkout();
  console.log(report);
  document.getElementById("cartOutput").innerHTML = report;
  updateSum();
}