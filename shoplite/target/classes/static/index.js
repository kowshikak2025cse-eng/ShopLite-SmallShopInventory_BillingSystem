// =====================================================
// SHOPLITE - SMALL SHOP INVENTORY & BILLING SYSTEM
// =====================================================
// ============================================
// LOGIN PROTECTION
// ============================================

const isLoggedIn =
    localStorage.getItem("shopliteLoggedIn");


if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}
const API = {
    products: "/api/products",
    bills: "/api/bills"
};

const LOW_STOCK_LIMIT = 5;

let products = [];
let bills = [];

let editingProductId = null;
let billingItems = [];
let selectedBillId = null;


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    updateCurrentDate();

    loadProducts();

    loadBills();

});


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            showPage(page);

        });

    });

}


function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active-page");
    });

    const target = document.getElementById(page + "Page");

    if (target) {
        target.classList.add("active-page");
    }


    document.querySelectorAll(".nav-item").forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === page) {
            button.classList.add("active");
        }

    });


    const titles = {
        dashboard: ["Dashboard", "Overview of your shop"],
        products: ["Products", "Manage your shop products"],
        billing: ["Create Bill", "Create a real-time shop bill"],
        bills: ["Bills", "View your shop bills as real receipts"],
        inventory: ["Inventory", "Monitor your current stock"]
    };

    if (titles[page]) {

        document.getElementById("pageTitle").textContent =
            titles[page][0];

        document.getElementById("pageSubtitle").textContent =
            titles[page][1];

    }


    if (page === "billing") {
        populateBillingProducts();
        updateLiveReceipt();
    }

    if (page === "inventory") {
        renderInventory();
    }

    if (page === "dashboard") {
        updateDashboard();
    }

}


// =====================================================
// DATE
// =====================================================

function updateCurrentDate() {

    const date = new Date();

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

}


// =====================================================
// PRODUCTS
// =====================================================

async function loadProducts() {

    try {

        const response = await fetch(
            `${API.products}/getProducts`
        );

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        products = await response.json();

        renderProducts();

        populateBillingProducts();

        updateDashboard();

        renderInventory();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load products",
            "error"
        );

    }

}


function renderProducts() {

    const table = document.getElementById("productsTable");

    if (!table) return;

    const search =
        document.getElementById("productSearch")?.value
        .toLowerCase()
        .trim() || "";


    const filteredProducts = products.filter(product =>
        String(product.name || "")
            .toLowerCase()
            .includes(search)
    );


    if (filteredProducts.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-receipt">
                    No products found
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = filteredProducts.map(product => {

        const status = getStockStatus(product.quantity);

        return `
            <tr>

                <td class="product-id">
                    #${product.id}
                </td>

                <td>
                    <span class="product-name">
                        ${escapeHtml(product.name)}
                    </span>
                </td>

                <td>
                    ₹${formatMoney(product.price)}
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>
                    <span class="status ${status.class}">
                        ${status.text}
                    </span>
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button
                        class="danger-btn"
                        onclick="deleteProduct(${product.id})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    }).join("");

}


// =====================================================
// PRODUCT MODAL
// =====================================================

function openProductModal(product = null) {

    const modal = document.getElementById("productModal");

    modal.classList.add("show");


    if (product) {

        editingProductId = product.id;

        document.getElementById("modalTitle").textContent =
            "Edit Product";

        document.getElementById("productName").value =
            product.name || "";

        document.getElementById("productPrice").value =
            product.price || 0;

        document.getElementById("productQuantity").value =
            product.quantity || 0;

    } else {

        editingProductId = null;

        document.getElementById("modalTitle").textContent =
            "Add Product";

        document.getElementById("productName").value = "";

        document.getElementById("productPrice").value = "";

        document.getElementById("productQuantity").value = "";

    }

}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.remove("show");

}


function editProduct(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );

    if (product) {
        openProductModal(product);
    }

}


async function saveProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const quantity =
        Number(document.getElementById("productQuantity").value);


    if (!name) {

        showToast(
            "Enter product name",
            "error"
        );

        return;
    }


    if (price < 0 || Number.isNaN(price)) {

        showToast(
            "Enter a valid price",
            "error"
        );

        return;
    }


    if (quantity < 0 || Number.isNaN(quantity)) {

        showToast(
            "Enter a valid quantity",
            "error"
        );

        return;
    }


    const productData = {
        name: name,
        price: price,
        quantity: quantity
    };


    try {

        let response;


        if (editingProductId) {

            response = await fetch(
                `${API.products}/updateProduct/${editingProductId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(productData)
                }
            );

        } else {

            response = await fetch(
                `${API.products}/createProduct`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(productData)
                }
            );

        }


        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText || "Unable to save product"
            );

        }


        closeProductModal();

        await loadProducts();

        showToast(
            editingProductId
                ? "Product updated successfully"
                : "Product added successfully",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Unable to save product",
            "error"
        );

    }

}


async function deleteProduct(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );


    if (!product) return;


    const confirmed = confirm(
        `Delete "${product.name}"?`
    );


    if (!confirmed) return;


    try {

        const response = await fetch(
            `${API.products}/deleteProduct/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to delete product"
            );

        }


        await loadProducts();


        showToast(
            "Product deleted successfully",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// BILLING PRODUCT DROPDOWN
// =====================================================

function populateBillingProducts() {

    const select =
        document.getElementById("billProduct");

    if (!select) return;


    const availableProducts =
        products.filter(product =>
            Number(product.quantity) > 0
        );


    if (availableProducts.length === 0) {

        select.innerHTML = `
            <option value="">
                No products available
            </option>
        `;

        return;
    }


    select.innerHTML = `
        <option value="">
            Select a product
        </option>

        ${availableProducts.map(product => `
            <option value="${product.id}">
                ${escapeHtml(product.name)}
                - ₹${formatMoney(product.price)}
                (${product.quantity} available)
            </option>
        `).join("")}
    `;

}


// =====================================================
// BILLING - ADD ITEM
// =====================================================

function addBillItem() {

    const productId =
        Number(document.getElementById("billProduct").value);

    const quantity =
        Number(document.getElementById("billQuantity").value);


    if (!productId) {

        showToast(
            "Select a product",
            "error"
        );

        return;
    }


    if (!quantity || quantity <= 0) {

        showToast(
            "Enter a valid quantity",
            "error"
        );

        return;
    }


    const product =
        products.find(
            item => Number(item.id) === productId
        );


    if (!product) {

        showToast(
            "Product not found",
            "error"
        );

        return;
    }


    const existing =
        billingItems.find(
            item => Number(item.product.id) === productId
        );


    const existingQuantity =
        existing ? existing.quantity : 0;


    if (
        existingQuantity + quantity >
        Number(product.quantity)
    ) {

        showToast(
            `Only ${product.quantity} units available`,
            "error"
        );

        return;
    }


    if (existing) {

        existing.quantity += quantity;

    } else {

        billingItems.push({
            product: product,
            quantity: quantity
        });

    }


    document.getElementById("billQuantity").value = 1;

    document.getElementById("billProduct").value = "";

    renderBillingItems();

    updateLiveReceipt();

}


// =====================================================
// BILLING ITEMS TABLE
// =====================================================

function renderBillingItems() {

    const table =
        document.getElementById("billingItemsTable");


    if (billingItems.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-receipt">
                    No items added
                </td>
            </tr>
        `;

        document.getElementById("billingTotal").textContent =
            "₹0.00";

        return;
    }


    table.innerHTML = billingItems.map((item, index) => {

        const amount =
            Number(item.product.price) *
            Number(item.quantity);


        return `
            <tr>

                <td>
                    <strong>
                        ${escapeHtml(item.product.name)}
                    </strong>
                </td>

                <td>
                    ${item.quantity}
                </td>

                <td>
                    ₹${formatMoney(item.product.price)}
                </td>

                <td>
                    ₹${formatMoney(amount)}
                </td>

                <td>

                    <button
                        class="danger-btn"
                        onclick="removeBillItem(${index})">
                        ×
                    </button>

                </td>

            </tr>
        `;

    }).join("");


    const total =
        calculateBillingTotal();


    document.getElementById("billingTotal").textContent =
        `₹${formatMoney(total)}`;

}


function removeBillItem(index) {

    billingItems.splice(index, 1);

    renderBillingItems();

    updateLiveReceipt();

}


// =====================================================
// BILL TOTAL
// =====================================================

function calculateBillingTotal() {

    return billingItems.reduce(
        (sum, item) =>
            sum +
            (
                Number(item.product.price) *
                Number(item.quantity)
            ),
        0
    );

}


// =====================================================
// LIVE BILL RECEIPT
// =====================================================

function updateLiveReceipt() {

    const customer =
        document.getElementById("customerName")?.value.trim();


    document.getElementById("previewCustomer").textContent =
        customer || "Walk-in Customer";


    const now = new Date();

    document.getElementById("previewDate").textContent =
        now.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });


    const previewItems =
        document.getElementById("previewItems");


    if (billingItems.length === 0) {

        previewItems.innerHTML = `
            <tr>
                <td colspan="4" class="empty-receipt">
                    No items added
                </td>
            </tr>
        `;

    } else {

        previewItems.innerHTML =
            billingItems.map(item => {

                const amount =
                    Number(item.product.price) *
                    Number(item.quantity);


                return `
                    <tr>

                        <td>
                            ${escapeHtml(item.product.name)}
                        </td>

                        <td>
                            ${item.quantity}
                        </td>

                        <td>
                            ₹${formatMoney(item.product.price)}
                        </td>

                        <td>
                            ₹${formatMoney(amount)}
                        </td>

                    </tr>
                `;

            }).join("");

    }


    const total =
        calculateBillingTotal();


    document.getElementById("previewTotal").textContent =
        `₹${formatMoney(total)}`;

}


document.addEventListener("input", event => {

    if (event.target.id === "customerName") {
        updateLiveReceipt();
    }

});


// =====================================================
// CREATE BILL
// =====================================================

async function createBill() {

    if (billingItems.length === 0) {

        showToast(
            "Add at least one product",
            "error"
        );

        return;
    }


    const customerName =
        document.getElementById("customerName")
            .value.trim();


    const payload = {

        customerName:
            customerName || "Walk-in Customer",

        paymentStatus: "Paid",

        items: billingItems.map(item => ({

            product: {
                id: item.product.id
            },

            quantity: item.quantity

        }))

    };


    try {

        const response = await fetch(
            `${API.bills}/createBill`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Unable to create bill"
            );

        }


        const createdBill =
            await response.json();


        showToast(
            "Bill created successfully",
            "success"
        );


        // Clear current billing
        billingItems = [];

        document.getElementById("customerName").value = "";

        renderBillingItems();

        updateLiveReceipt();


        // Reload products because stock was reduced
        await loadProducts();

        // Reload bills
        await loadBills();


        // Show saved bill
        if (createdBill && createdBill.id) {

            selectedBillId = createdBill.id;

            showPage("bills");

            await renderSelectedBill(createdBill);

        }


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to create bill",
            "error"
        );

    }

}


// =====================================================
// LOAD BILLS
// =====================================================

async function loadBills() {

    try {

        const response = await fetch(
            `${API.bills}/getBills`
        );


        if (!response.ok) {
            throw new Error("Unable to load bills");
        }


        bills = await response.json();


        // newest first
        bills.sort(
            (a, b) =>
                new Date(b.billDate) -
                new Date(a.billDate)
        );


        renderBillHistory();

        updateDashboard();


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load bills",
            "error"
        );

    }

}


// =====================================================
// BILL HISTORY
// =====================================================

function renderBillHistory() {

    const container =
        document.getElementById("billHistory");


    if (!container) return;


    if (bills.length === 0) {

        container.innerHTML = `
            <div class="no-receipt">
                <div>🧾</div>
                <h3>No Bills Yet</h3>
                <p>Create your first bill from Billing.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = bills.map(bill => {

        const billNo =
            `INV-${String(bill.id).padStart(4, "0")}`;


        const status =
            getPaymentStatus(bill.paymentStatus);


        const date =
            formatDateTime(bill.billDate);


        return `
            <div
                class="bill-history-item
                ${selectedBillId === bill.id ? "selected" : ""}"
                onclick="selectBill(${bill.id})">

                <div class="bill-history-top">

                    <span class="bill-number">
                        ${billNo}
                    </span>

                    <span class="status ${status.class}">
                        ${status.text}
                    </span>

                </div>


                <div class="bill-customer">

                    ${escapeHtml(
                        bill.customerName ||
                        "Walk-in Customer"
                    )}

                </div>


                <div class="bill-date">

                    ${date}

                </div>


                <div class="bill-history-bottom">

                    <span class="bill-amount">
                        ₹${formatMoney(bill.totalAmount)}
                    </span>

                    <span>
                        ${(bill.items || []).length}
                        item(s)
                    </span>

                </div>

            </div>
        `;

    }).join("");

}


// =====================================================
// SELECT BILL
// =====================================================

async function selectBill(id) {

    selectedBillId = id;

    renderBillHistory();

    await renderSelectedBillById(id);

}


async function renderSelectedBillById(id) {

    try {

        const response = await fetch(
            `${API.bills}/getBill/${id}`
        );


        if (!response.ok) {
            throw new Error("Unable to load bill");
        }


        const bill =
            await response.json();


        await renderSelectedBill(bill);


    } catch (error) {

        console.error(error);

        // fallback to already-loaded bill
        const bill =
            bills.find(
                item => Number(item.id) === Number(id)
            );


        if (bill) {
            renderSelectedBill(bill);
        } else {

            showToast(
                "Unable to load bill",
                "error"
            );

        }

    }

}


// =====================================================
// RENDER REAL RECEIPT
// =====================================================

async function renderSelectedBill(bill) {

    selectedBillId = bill.id;

    const container =
        document.getElementById(
            "savedReceiptContainer"
        );


    const billNo =
        `INV-${String(bill.id).padStart(4, "0")}`;


    const status =
        getPaymentStatus(bill.paymentStatus);


    const items =
        bill.items || [];


    let itemsHtml = "";


    if (items.length === 0) {

        itemsHtml = `
            <tr>
                <td colspan="4"
                    class="empty-receipt">
                    No items found
                </td>
            </tr>
        `;

    } else {

        itemsHtml = items.map(item => {

            const productName =
                item.product?.name ||
                "Unknown Product";


            const quantity =
                Number(item.quantity || 0);


            const unitPrice =
                Number(item.unitPrice || 0);


            const totalPrice =
                Number(
                    item.totalPrice ||
                    quantity * unitPrice
                );


            return `
                <tr>

                    <td>
                        ${escapeHtml(productName)}
                    </td>

                    <td>
                        ${quantity}
                    </td>

                    <td>
                        ₹${formatMoney(unitPrice)}
                    </td>

                    <td>
                        ₹${formatMoney(totalPrice)}
                    </td>

                </tr>
            `;

        }).join("");

    }


    container.innerHTML = `

        <div class="receipt saved-receipt">

            <div class="receipt-header">

                <div class="receipt-logo">
                    🛒
                </div>

                <h2>SHOPLITE</h2>

                <p>
                    Small Shop Inventory & Billing
                </p>

            </div>


            <div class="receipt-line"></div>


            <div class="receipt-info">

                <div>

                    <span>Bill No</span>

                    <strong>
                        ${billNo}
                    </strong>

                </div>


                <div>

                    <span>Date</span>

                    <strong>
                        ${formatDateTime(bill.billDate)}
                    </strong>

                </div>


                <div>

                    <span>Customer</span>

                    <strong>
                        ${escapeHtml(
                            bill.customerName ||
                            "Walk-in Customer"
                        )}
                    </strong>

                </div>


                <div>

    <span>Payment</span>

    <select
        class="payment-status-select"
        onchange="updatePaymentStatus(${bill.id}, this.value)"
    >
        <option value="PAID"
            ${String(bill.paymentStatus || "").toUpperCase() === "PAID" ? "selected" : ""}>
            Paid
        </option>

        <option value="PENDING"
            ${String(bill.paymentStatus || "").toUpperCase() === "PENDING" ? "selected" : ""}>
            Pending
        </option>

        <option value="CANCELLED"
            ${String(bill.paymentStatus || "").toUpperCase() === "CANCELLED" ? "selected" : ""}>
            Cancelled
        </option>
    </select>

</div>

            </div>


            <div class="receipt-line"></div>


            <table class="receipt-table">

                <thead>

                    <tr>

                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>

                    </tr>

                </thead>


                <tbody>

                    ${itemsHtml}

                </tbody>

            </table>


            <div class="receipt-line"></div>


            <div class="receipt-total">

                <span>TOTAL</span>

                <strong>
                    ₹${formatMoney(bill.totalAmount)}
                </strong>

            </div>


            <div class="receipt-footer">

                <p>
                    Thank you for shopping with us!
                </p>

                <small>
                    Have a great day 😊
                </small>

            </div>

        </div>

    `;

}
// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

async function updatePaymentStatus(id, status) {

    try {

        const response = await fetch(
            `${API.bills}/updateBill/${id}?paymentStatus=${encodeURIComponent(status)}`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unable to update payment status");
        }

        showToast("Payment status updated successfully", "success");

        // Reload bills
        await loadBills();

        // Reload selected receipt
        await renderSelectedBillById(id);

    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Unable to update payment status",
            "error"
        );
    }
}

// =====================================================
// PRINT RECEIPT
// =====================================================

function printReceipt() {

    if (!selectedBillId) {

        showToast(
            "Select a bill first",
            "error"
        );

        return;
    }


    window.print();

}


// =====================================================
// INVENTORY
// =====================================================

function renderInventory() {

    const table =
        document.getElementById(
            "inventoryTable"
        );


    if (!table) return;


    if (products.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4"
                    class="empty-receipt">
                    No products found
                </td>
            </tr>
        `;

        updateInventorySummary();

        return;
    }


    table.innerHTML =
        products.map(product => {

            const status =
                getStockStatus(product.quantity);


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>
                    </td>

                    <td>
                        ₹${formatMoney(product.price)}
                    </td>

                    <td>
                        ${product.quantity}
                    </td>

                    <td>

                        <span
                            class="status ${status.class}">
                            ${status.text}
                        </span>

                    </td>

                </tr>
            `;

        }).join("");


    updateInventorySummary();

}


function updateInventorySummary() {

    const totalProducts =
        products.length;


    const totalUnits =
        products.reduce(
            (sum, product) =>
                sum + Number(product.quantity || 0),
            0
        );


    const lowStock =
        products.filter(
            product =>
                Number(product.quantity) > 0 &&
                Number(product.quantity) <= LOW_STOCK_LIMIT
        ).length;


    const outOfStock =
        products.filter(
            product =>
                Number(product.quantity) === 0
        ).length;


    document.getElementById(
        "inventoryProducts"
    ).textContent = totalProducts;


    document.getElementById(
        "inventoryUnits"
    ).textContent = totalUnits;


    document.getElementById(
        "inventoryLow"
    ).textContent = lowStock;


    document.getElementById(
        "inventoryOut"
    ).textContent = outOfStock;

}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (sum, product) =>
                sum + Number(product.quantity || 0),
            0
        );


    const totalBills =
        bills.length;


    const totalSales =
        bills.reduce(
            (sum, bill) =>
                sum + Number(bill.totalAmount || 0),
            0
        );


    document.getElementById(
        "totalProducts"
    ).textContent = totalProducts;


    document.getElementById(
        "totalStock"
    ).textContent = totalStock;


    document.getElementById(
        "totalBills"
    ).textContent = totalBills;


    document.getElementById(
        "totalSales"
    ).textContent =
        `₹${formatMoney(totalSales)}`;


    renderRecentBills();

    renderStockAlerts();

}


function renderRecentBills() {

    const container =
        document.getElementById("recentBills");


    if (!container) return;


    const recent =
        bills.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="no-receipt">
                <p>No bills available</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(bill => {

            return `
                <div class="bill-history-item"
                     onclick="
                        showPage('bills');
                        selectBill(${bill.id});
                     ">

                    <div class="bill-history-top">

                        <span class="bill-number">
                            INV-${String(bill.id).padStart(4, "0")}
                        </span>

                        <span class="bill-amount">
                            ₹${formatMoney(bill.totalAmount)}
                        </span>

                    </div>

                    <div class="bill-customer">

                        ${escapeHtml(
                            bill.customerName ||
                            "Walk-in Customer"
                        )}

                    </div>

                    <div class="bill-date">

                        ${formatDateTime(bill.billDate)}

                    </div>

                </div>
            `;

        }).join("");

}


function renderStockAlerts() {

    const container =
        document.getElementById("stockAlerts");


    if (!container) return;


    const alerts =
        products.filter(
            product =>
                Number(product.quantity) <=
                LOW_STOCK_LIMIT
        );


    if (alerts.length === 0) {

        container.innerHTML = `
            <div class="no-receipt">
                <div>✅</div>
                <h3>Stock looks good</h3>
                <p>No low-stock products.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        alerts.map(product => {

            const status =
                getStockStatus(product.quantity);


            return `
                <div class="bill-history-item">

                    <div class="bill-history-top">

                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <span class="status ${status.class}">
                            ${status.text}
                        </span>

                    </div>

                    <div class="bill-date">
                        Current stock:
                        ${product.quantity}
                    </div>

                </div>
            `;

        }).join("");

}


// =====================================================
// STOCK STATUS
// =====================================================

function getStockStatus(quantity) {

    quantity = Number(quantity || 0);


    if (quantity === 0) {

        return {
            text: "Out of Stock",
            class: "out"
        };

    }


    if (quantity <= LOW_STOCK_LIMIT) {

        return {
            text: "Low Stock",
            class: "low"
        };

    }


    return {
        text: "Available",
        class: "available"
    };

}


// =====================================================
// PAYMENT STATUS
// =====================================================

function getPaymentStatus(status) {

    const value =
        String(status || "Pending")
            .toLowerCase();


    if (value === "paid") {

        return {
            text: "Paid",
            class: "paid"
        };

    }


    return {
        text:
            status ||
            "Pending",

        class: "pending"
    };

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "--";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "--";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(value) {

    return Number(value || 0)
        .toFixed(2);

}


// =====================================================
// HTML SECURITY
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "") {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;

    toast.className = "toast show " + type;


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

document
    .getElementById("productModal")
    ?.addEventListener("click", event => {

        if (
            event.target.id ===
            "productModal"
        ) {

            closeProductModal();

        }

    });

    // ============================================
// DISPLAY SHOP OWNER
// ============================================

function loadCurrentUser() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "shopliteCurrentUser"
            )
        );


    if (user) {

        const ownerName =
            document.getElementById(
                "ownerName"
            );

        if (ownerName) {

            ownerName.textContent =
                user.name;

        }

    }

}


loadCurrentUser();


// ============================================
// LOGOUT
// ============================================

function logout() {

    localStorage.removeItem(
        "shopliteLoggedIn"
    );

    localStorage.removeItem(
        "shopliteCurrentUser"
    );


    window.location.href =
        "login.html";

}