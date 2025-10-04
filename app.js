let items = []; //global array

function addItem() {
  let code = document.getElementById("itemCode").value;
  let name = document.getElementById("itemName").value;
  let qty = parseInt(document.getElementById("quantity").value);
  let price = parseFloat(document.getElementById("price").value);

  if (!code || !name || isNaN(qty) || isNaN(price)) {
    alert("Please fill all fields");
    return;
  }

  let existing = items.find(item => item.itemCode === code);
  if (existing) {
    alert("Item code already exists. Use Update instead.");
    return;
  }

  let newItem = { itemCode: code, itemName: name, quantity: qty, price: price };
  items.push(newItem);
  console.log("Added:", newItem);
  renderList();
  document.getElementById("itemForm").reset();
}

function updateItemFromForm() {
  let code = document.getElementById("itemCode").value;
  let name = document.getElementById("itemName").value;
  let qty = parseInt(document.getElementById("quantity").value);
  let price = parseFloat(document.getElementById("price").value);

  let item = items.find(i => i.itemCode === code);
  if (item) {
    if (name) item.itemName = name;
    if (!isNaN(qty)) item.quantity = qty;
    if (!isNaN(price)) item.price = price;
    console.log("Updated:", item);
    renderList();
    document.getElementById("itemForm").reset();
  } else {
    alert("Item not found!");
  }
}

function deleteItem(code) {
  if (confirm("Are you sure you want to delete item " + code + "?")) {
    items = items.filter(i => i.itemCode !== code);
    console.log("Deleted:", code);
    renderList();
  }
}

function filterItems() {
  let filtered = items.filter(i => i.quantity < 10);
  console.log("Filtered:", filtered);
  renderList(filtered);
}

let sortNameAsc = true;
let sortPriceAsc = true;

function sortByName() {
  items.sort((a, b) =>
    sortNameAsc ? a.itemName.localeCompare(b.itemName) : b.itemName.localeCompare(a.itemName)
  );
  sortNameAsc = !sortNameAsc;
  console.log("Sorted by Name:", items);
  renderList();
}

function sortByPrice() {
  items.sort((a, b) =>
    sortPriceAsc ? a.price - b.price : b.price - a.price
  );
  sortPriceAsc = !sortPriceAsc;
  console.log("Sorted by Price:", items);
  renderList();
}

function resetList() {
  renderList();
}

function searchItems(keyword) {
  keyword = keyword.toLowerCase();
  let results = items.filter(i =>
    i.itemName.toLowerCase().includes(keyword) ||
    i.itemCode.toLowerCase().includes(keyword)
  );
  console.log("Search Results:", results);
  renderList(results);
}

let tableView = true; // start with table view

function toggleView() {
  tableView = !tableView;
  renderList();
}

//render list make the table dynamic
function renderList(arr = items) {
  if (tableView) {
    //Table view
    let output = "<table border='1' cellpadding='5'><tr><th>Code</th><th>Name</th><th>Quantity</th><th>Price</th><th>Action</th></tr>";
    arr.forEach(i => {
      let style = i.quantity === 0 ? " style='color:red;'" : "";
      output += `<tr${style}>
                  <td>${i.itemCode}</td>
                  <td>${i.itemName}</td>
                  <td>${i.quantity}</td>
                  <td>${i.price}</td>
                  <td><button onclick="deleteItem('${i.itemCode}')">Delete</button></td>
                 </tr>`;
    });
    output += "</table>";
    document.getElementById("list").innerHTML = output;
  } else {
    //card view
    let output = "";
    arr.forEach(i => {
      let red = i.quantity === 0 ? " style='color:red;'" : "";
      output += `<div ${red} style="border:1px solid black; margin:5px; padding:5px;">
                   <strong>${i.itemName}</strong> (${i.itemCode})<br>
                   Qty: ${i.quantity}<br>
                   Price: PHP ${i.price}<br>
                   <button onclick="deleteItem('${i.itemCode}')">Delete</button>
                 </div>`;
    });
    document.getElementById("list").innerHTML = output;
  }

  //summary of the products quantity and its prices
  let totalQty = arr.reduce((sum, i) => sum + i.quantity, 0);
  let totalVal = arr.reduce((sum, i) => sum + (i.quantity * i.price), 0);
  document.getElementById("summary").innerHTML =
    "Total Items: " + arr.length + "<br>Total Quantity: " + totalQty + "<br>Total Value: PHP " + totalVal;
}

let cart = {
  items: [],
  add: function(itemObj, qty) {
    if (qty > itemObj.quantity) {
      return "Not enough stock!";
    }
    this.items.push({ name: itemObj.itemName, qty: qty, price: itemObj.price });
    itemObj.quantity -= qty;
    return itemObj.itemName + " added to cart.";
  },
  checkout: function() {
    let total = this.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    let tax = total * 0.12;
    let final = total + tax;
    if (final > 5000) {
      final *= 0.9;
    }
    return "Checkout Summary: " + this.items.length + " item(s). Total = PHP " + final;
  }
};

function testAddToCart() {
  if (items.length === 0) {
    alert("No items in inventory yet!");
    return;
  }
  let msg = cart.add(items[0], 1);
  console.log(msg);
  document.getElementById("cartOutput").innerHTML = msg;
}

function showCheckout() {
  let report = cart.checkout();
  console.log(report);
  document.getElementById("cartOutput").innerHTML = report;
}
