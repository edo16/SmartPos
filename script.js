/* =====================================================
   SMARTPOS V2
   Point of Sale + Analytics + LocalStorage
===================================================== */


/* =====================================================
   DATA
===================================================== */

let products =
    JSON.parse(
        localStorage.getItem(
            "smartpos_products"
        )
    ) || [

        {
            id: 1,
            name: "Mie Ayam",
            category: "Makanan",
            price: 15000,
            stock: 20
        },

        {
            id: 2,
            name: "Bakso",
            category: "Makanan",
            price: 14000,
            stock: 15
        },

        {
            id: 3,
            name: "Nasi Goreng",
            category: "Makanan",
            price: 18000,
            stock: 12
        },

        {
            id: 4,
            name: "Es Teh",
            category: "Minuman",
            price: 5000,
            stock: 30
        },

        {
            id: 5,
            name: "Es Jeruk",
            category: "Minuman",
            price: 7000,
            stock: 25
        },

        {
            id: 6,
            name: "Kopi Susu",
            category: "Minuman",
            price: 12000,
            stock: 10
        },

        {
            id: 7,
            name: "Kentang Goreng",
            category: "Snack",
            price: 10000,
            stock: 8
        },

        {
            id: 8,
            name: "Pisang Coklat",
            category: "Snack",
            price: 9000,
            stock: 6
        }

    ];


let cart =
    JSON.parse(
        localStorage.getItem(
            "smartpos_cart"
        )
    ) || [];


let transactions =
    JSON.parse(
        localStorage.getItem(
            "smartpos_transactions"
        )
    ) || [];


let selectedTransaction = null;


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveData() {

    localStorage.setItem(
        "smartpos_products",
        JSON.stringify(products)
    );


    localStorage.setItem(
        "smartpos_cart",
        JSON.stringify(cart)
    );


    localStorage.setItem(
        "smartpos_transactions",
        JSON.stringify(transactions)
    );

}


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* =====================================================
   DATE
===================================================== */

function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


function renderCurrentDate() {

    const today =
        new Date()
            .toLocaleDateString(
                "id-ID",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


    document.getElementById(
        "currentDate"
    ).textContent =
        today;

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const target =
        document.getElementById(
            pageId
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-link")
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.page ===
                pageId
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    const titles = {

        dashboard:
            "Dashboard",

        pos:
            "Point of Sale",

        products:
            "Produk",

        transactions:
            "Transaksi"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[pageId] ||
        "SmartPOS";


    if (pageId === "dashboard") {

        renderDashboard();

    }


    if (pageId === "pos") {

        renderCategories();

        renderPOSProducts();

        renderCart();

    }


    if (pageId === "products") {

        renderProductTable();

    }


    if (pageId === "transactions") {

        renderTransactions();

    }


    document
        .querySelector(".sidebar")
        .classList.remove(
            "mobile-open"
        );

}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle(
            "mobile-open"
        );

}


/* =====================================================
   DARK MODE
===================================================== */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(
        "smartpos_dark",
        document.body.classList.contains(
            "dark"
        )
    );

}


function loadDarkMode() {

    const dark =
        localStorage.getItem(
            "smartpos_dark"
        ) === "true";


    if (dark) {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =====================================================
   CATEGORY
===================================================== */

function renderCategories() {

    const select =
        document.getElementById(
            "productCategory"
        );


    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        product.category
                )
            )
        ];


    select.innerHTML = `
        <option value="all">
            Semua Kategori
        </option>
    `;


    categories.forEach(
        category => {

            select.innerHTML += `
                <option value="${category}">
                    ${category}
                </option>
            `;

        }
    );

}


/* =====================================================
   POS PRODUCT
===================================================== */

function renderPOSProducts() {

    const grid =
        document.getElementById(
            "posProductGrid"
        );


    const search =
        document.getElementById(
            "productSearch"
        )
        .value
        .toLowerCase();


    const category =
        document.getElementById(
            "productCategory"
        )
        .value;


    const filtered =
        products.filter(
            product => {

                const matchSearch =
                    product.name
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchCategory =
                    category === "all" ||
                    product.category ===
                        category;


                return (
                    matchSearch &&
                    matchCategory
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        grid.innerHTML = `
            <div class="empty-state">
                Produk tidak ditemukan.
            </div>
        `;

        return;

    }


    grid.innerHTML =
        filtered.map(
            product => {

                const disabled =
                    product.stock <= 0;


                return `

                    <div
                        class="pos-product-card"
                        onclick="${
                            disabled
                                ? ""
                                : `addToCart(${product.id})`
                        }"
                        style="${
                            disabled
                                ? "opacity:.5;cursor:not-allowed;"
                                : ""
                        }"
                    >

                        <div class="product-placeholder">
                            ${
                                product.category ===
                                "Minuman"
                                    ? "🥤"
                                    : product.category ===
                                      "Snack"
                                    ? "🍟"
                                    : "🍜"
                            }
                        </div>


                        <h3>
                            ${product.name}
                        </h3>


                        <div class="product-category">
                            ${product.category}
                        </div>


                        <div class="product-price">
                            ${formatRupiah(
                                product.price
                            )}
                        </div>


                        <div class="product-stock">
                            ${
                                product.stock > 0
                                    ? `Stok ${product.stock}`
                                    : "STOK HABIS"
                            }
                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   ADD CART
===================================================== */

function addToCart(productId) {

    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product) return;


    if (
        product.stock <= 0
    ) {

        alert(
            "Stok produk habis."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.productId ===
                productId
        );


    if (existing) {

        if (
            existing.quantity >=
            product.stock
        ) {

            alert(
                "Jumlah melebihi stok."
            );

            return;

        }


        existing.quantity++;

    } else {

        cart.push({

            productId:
                productId,

            quantity:
                1

        });

    }


    saveData();

    renderCart();

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    if (
        cart.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                🛒
                <br><br>
                Keranjang masih kosong.
            </div>
        `;

        updateCartSummary();

        return;

    }


    container.innerHTML =
        cart.map(
            item => {

                const product =
                    products.find(
                        p =>
                            p.id ===
                            item.productId
                    );


                if (!product)
                    return "";


                return `

                    <div class="cart-item">

                        <div>

                            <h4>
                                ${product.name}
                            </h4>

                            <div class="cart-item-price">
                                ${formatRupiah(
                                    product.price
                                )}
                            </div>


                            <div class="quantity-control">

                                <button
                                    onclick="changeQuantity(
                                        ${product.id},
                                        -1
                                    )"
                                >
                                    −
                                </button>

                                <span>
                                    ${item.quantity}
                                </span>

                                <button
                                    onclick="changeQuantity(
                                        ${product.id},
                                        1
                                    )"
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <div class="cart-item-total">

                            ${formatRupiah(
                                product.price *
                                item.quantity
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");


    updateCartSummary();

}


/* =====================================================
   CHANGE QUANTITY
===================================================== */

function changeQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            i =>
                i.productId ===
                productId
        );


    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!item || !product)
        return;


    item.quantity +=
        change;


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                i =>
                    i.productId !==
                    productId
            );

    }


    if (
        item.quantity >
        product.stock
    ) {

        item.quantity =
            product.stock;

        alert(
            "Jumlah tidak boleh melebihi stok."
        );

    }


    saveData();

    renderCart();

}


/* =====================================================
   CLEAR CART
===================================================== */

function clearCart() {

    if (
        cart.length === 0
    )
        return;


    if (
        !confirm(
            "Kosongkan keranjang?"
        )
    )
        return;


    cart = [];


    document.getElementById(
        "discountInput"
    ).value = 0;


    saveData();

    renderCart();

}


/* =====================================================
   CART SUMMARY
===================================================== */

function getCartSummary() {

    let subtotal = 0;

    let items = 0;


    cart.forEach(
        item => {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.productId
                );


            if (!product)
                return;


            subtotal +=
                product.price *
                item.quantity;


            items +=
                item.quantity;

        }
    );


    const discount =
        Number(
            document.getElementById(
                "discountInput"
            ).value
        ) || 0;


    const taxable =
        Math.max(
            subtotal -
            discount,
            0
        );


    const tax =
        taxable *
        0.11;


    const total =
        taxable +
        tax;


    return {

        subtotal,

        discount,

        tax,

        total,

        items

    };

}


function updateCartSummary() {

    const summary =
        getCartSummary();


    document.getElementById(
        "cartSubtotal"
    ).textContent =
        formatRupiah(
            summary.subtotal
        );


    document.getElementById(
        "cartTax"
    ).textContent =
        formatRupiah(
            summary.tax
        );


    document.getElementById(
        "cartTotal"
    ).textContent =
        formatRupiah(
            summary.total
        );


    document.getElementById(
        "cartCount"
    ).textContent =
        `${summary.items} item`;

}


/* =====================================================
   PAYMENT MODAL
===================================================== */

function openPaymentModal() {

    if (
        cart.length === 0
    ) {

        alert(
            "Keranjang masih kosong."
        );

        return;

    }


    const summary =
        getCartSummary();


    document.getElementById(
        "paymentTotal"
    ).textContent =
        formatRupiah(
            summary.total
        );


    document.getElementById(
        "paymentAmount"
    ).value = "";


    document.getElementById(
        "paymentMethod"
    ).value =
        "Cash";


    handlePaymentMethod();


    document.getElementById(
        "changeAmount"
    ).textContent =
        formatRupiah(0);


    document.getElementById(
        "paymentModal"
    ).classList.add(
        "show"
    );

}


function closePaymentModal() {

    document.getElementById(
        "paymentModal"
    ).classList.remove(
        "show"
    );

}


/* =====================================================
   PAYMENT METHOD
===================================================== */

function handlePaymentMethod() {

    const method =
        document.getElementById(
            "paymentMethod"
        ).value;


    const cashGroup =
        document.getElementById(
            "cashPaymentGroup"
        );


    if (
        method === "Cash"
    ) {

        cashGroup.style.display =
            "block";

    } else {

        cashGroup.style.display =
            "none";

        document.getElementById(
            "paymentAmount"
        ).value = "";

        document.getElementById(
            "changeAmount"
        ).textContent =
            formatRupiah(0);

    }

}


/* =====================================================
   CALCULATE CHANGE
===================================================== */

function calculateChange() {

    const summary =
        getCartSummary();


    const payment =
        Number(
            document.getElementById(
                "paymentAmount"
            ).value
        ) || 0;


    const change =
        Math.max(
            payment -
            summary.total,
            0
        );


    document.getElementById(
        "changeAmount"
    ).textContent =
        formatRupiah(
            change
        );

}


/* =====================================================
   COMPLETE TRANSACTION
===================================================== */

function completeTransaction() {

    if (
        cart.length === 0
    )
        return;


    const summary =
        getCartSummary();


    const method =
        document.getElementById(
            "paymentMethod"
        ).value;


    let payment = 0;


    if (
        method === "Cash"
    ) {

        payment =
            Number(
                document.getElementById(
                    "paymentAmount"
                ).value
            ) || 0;


        if (
            payment <
            summary.total
        ) {

            alert(
                "Uang pembayaran belum cukup."
            );

            return;

        }

    } else {

        payment =
            summary.total;

    }


    /* SAVE ITEMS */

    const transactionItems =
        cart.map(
            item => {

                const product =
                    products.find(
                        p =>
                            p.id ===
                            item.productId
                    );


                return {

                    productId:
                        product.id,

                    name:
                        product.name,

                    price:
                        product.price,

                    quantity:
                        item.quantity,

                    subtotal:
                        product.price *
                        item.quantity

                };

            }
        );


    /* UPDATE STOCK */

    cart.forEach(
        item => {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.productId
                );


            product.stock -=
                item.quantity;

        }
    );


    /* CREATE TRANSACTION */

    const transaction = {

        id:
            "TRX-" +
            Date.now(),

        date:
            new Date().toISOString(),

        items:
            transactionItems,

        itemCount:
            summary.items,

        subtotal:
            summary.subtotal,

        discount:
            summary.discount,

        tax:
            summary.tax,

        total:
            summary.total,

        payment:
            payment,

        change:
            Math.max(
                payment -
                summary.total,
                0
            ),

        method:
            method

    };


    transactions.unshift(
        transaction
    );


    /* RESET */

    cart = [];


    document.getElementById(
        "discountInput"
    ).value = 0;


    saveData();


    closePaymentModal();


    renderCart();

    renderPOSProducts();

    renderDashboard();

    renderProductTable();


    showTransactionDetail(
        transaction
    );


    alert(
        "Transaksi berhasil disimpan!"
    );

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(
    productId = null
) {

    const modal =
        document.getElementById(
            "productModal"
        );


    const title =
        document.getElementById(
            "productModalTitle"
        );


    if (
        productId
    ) {

        const product =
            products.find(
                p =>
                    p.id ===
                    productId
            );


        if (!product)
            return;


        title.textContent =
            "Edit Produk";


        document.getElementById(
            "editProductId"
        ).value =
            product.id;


        document.getElementById(
            "productNameInput"
        ).value =
            product.name;


        document.getElementById(
            "productCategoryInput"
        ).value =
            product.category;


        document.getElementById(
            "productPriceInput"
        ).value =
            product.price;


        document.getElementById(
            "productStockInput"
        ).value =
            product.stock;

    } else {

        title.textContent =
            "Tambah Produk";


        document.getElementById(
            "productForm"
        ).reset();


        document.getElementById(
            "editProductId"
        ).value = "";

    }


    modal.classList.add(
        "show"
    );

}


function closeProductModal() {

    document.getElementById(
        "productModal"
    ).classList.remove(
        "show"
    );

}


/* =====================================================
   SAVE PRODUCT
===================================================== */

document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const editId =
            Number(
                document.getElementById(
                    "editProductId"
                ).value
            );


        const name =
            document.getElementById(
                "productNameInput"
            ).value.trim();


        const category =
            document.getElementById(
                "productCategoryInput"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "productPriceInput"
                ).value
            );


        const stock =
            Number(
                document.getElementById(
                    "productStockInput"
                ).value
            );


        if (
            editId
        ) {

            const product =
                products.find(
                    p =>
                        p.id ===
                        editId
                );


            if (product) {

                product.name =
                    name;

                product.category =
                    category;

                product.price =
                    price;

                product.stock =
                    stock;

            }

        } else {

            products.push({

                id:
                    Date.now(),

                name:
                    name,

                category:
                    category,

                price:
                    price,

                stock:
                    stock

            });

        }


        saveData();


        closeProductModal();


        renderCategories();

        renderPOSProducts();

        renderProductTable();

        renderDashboard();

    }
);


/* =====================================================
   PRODUCT TABLE
===================================================== */

function renderProductTable() {

    const tbody =
        document.getElementById(
            "productTable"
        );


    const search =
        document.getElementById(
            "tableProductSearch"
        )
        .value
        .toLowerCase();


    const filtered =
        products.filter(
            product =>
                product.name
                    .toLowerCase()
                    .includes(
                        search
                    )
        );


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        Produk tidak ditemukan.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(
            product => {

                let status =
                    "available";

                let statusText =
                    "Tersedia";


                if (
                    product.stock === 0
                ) {

                    status =
                        "empty";

                    statusText =
                        "Habis";

                } else if (
                    product.stock <= 5
                ) {

                    status =
                        "low";

                    statusText =
                        "Stok Menipis";

                }


                return `

                    <tr>

                        <td>

                            <div class="product-name-cell">

                                <strong>
                                    ${product.name}
                                </strong>

                                <span>
                                    ID: ${product.id}
                                </span>

                            </div>

                        </td>


                        <td>
                            ${product.category}
                        </td>


                        <td>
                            ${formatRupiah(
                                product.price
                            )}
                        </td>


                        <td>
                            ${product.stock}
                        </td>


                        <td>

                            <span
                                class="status ${status}"
                            >
                                ${statusText}
                            </span>

                        </td>


                        <td>

                            <div
                                class="action-buttons"
                            >

                                <button
                                    class="action-button edit-button"
                                    onclick="openProductModal(
                                        ${product.id}
                                    )"
                                >
                                    Edit
                                </button>


                                <button
                                    class="action-button delete-button"
                                    onclick="deleteProduct(
                                        ${product.id}
                                    )"
                                >
                                    Hapus
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(
    productId
) {

    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product)
        return;


    if (
        !confirm(
            `Hapus produk "${product.name}"?`
        )
    )
        return;


    products =
        products.filter(
            p =>
                p.id !== productId
        );


    cart =
        cart.filter(
            item =>
                item.productId !==
                productId
        );


    saveData();


    renderProductTable();

    renderCategories();

    renderPOSProducts();

    renderCart();

    renderDashboard();

}


/* =====================================================
   TRANSACTIONS
===================================================== */

function renderTransactions() {

    const tbody =
        document.getElementById(
            "transactionTable"
        );


    const search =
        document.getElementById(
            "transactionSearch"
        )
        .value
        .toLowerCase();


    const method =
        document.getElementById(
            "transactionMethod"
        ).value;


    const date =
        document.getElementById(
            "transactionDate"
        ).value;


    const filtered =
        transactions.filter(
            transaction => {

                const matchSearch =
                    transaction.id
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchMethod =
                    method === "all" ||
                    transaction.method ===
                        method;


                const transactionDate =
                    transaction.date
                        .split("T")[0];


                const matchDate =
                    !date ||
                    transactionDate ===
                        date;


                return (
                    matchSearch &&
                    matchMethod &&
                    matchDate
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        Tidak ada transaksi.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(
            transaction => {

                return `

                    <tr>

                        <td>
                            <strong>
                                ${transaction.id}
                            </strong>
                        </td>


                        <td>
                            ${formatDate(
                                transaction.date
                            )}
                        </td>


                        <td>
                            ${transaction.itemCount}
                        </td>


                        <td>
                            ${formatRupiah(
                                transaction.total
                            )}
                        </td>


                        <td>
                            ${transaction.method}
                        </td>


                        <td>

                            <button
                                class="action-button edit-button"
                                onclick="showTransactionDetailById(
                                    '${transaction.id}'
                                )"
                            >
                                Detail
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   TRANSACTION DETAIL
===================================================== */

function showTransactionDetailById(
    transactionId
) {

    const transaction =
        transactions.find(
            t =>
                t.id ===
                transactionId
        );


    if (!transaction)
        return;


    showTransactionDetail(
        transaction
    );

}


function showTransactionDetail(
    transaction
) {

    selectedTransaction =
        transaction;


    const container =
        document.getElementById(
            "transactionDetail"
        );


    container.innerHTML = `

        <div class="receipt-title">

            <h3>
                SMARTPOS
            </h3>

            <p>
                Point of Sale
            </p>

        </div>


        <div class="receipt-info">

            <div>
                ID:
                ${transaction.id}
            </div>

            <div>
                ${formatDate(
                    transaction.date
                )}
            </div>

            <div>
                Metode:
                ${transaction.method}
            </div>

        </div>


        ${transaction.items
            .map(
                item => `

                    <div class="receipt-item">

                        <span>
                            ${item.name}
                            x${item.quantity}
                        </span>

                        <span>
                            ${formatRupiah(
                                item.subtotal
                            )}
                        </span>

                    </div>

                `
            )
            .join("")}


        <div class="receipt-total">

            <div>

                <span>
                    Subtotal
                </span>

                <span>
                    ${formatRupiah(
                        transaction.subtotal
                    )}
                </span>

            </div>


            <div>

                <span>
                    Diskon
                </span>

                <span>
                    ${formatRupiah(
                        transaction.discount
                    )}
                </span>

            </div>


            <div>

                <span>
                    Pajak
                </span>

                <span>
                    ${formatRupiah(
                        transaction.tax
                    )}
                </span>

            </div>


            <div class="receipt-grand">

                <span>
                    TOTAL
                </span>

                <span>
                    ${formatRupiah(
                        transaction.total
                    )}
                </span>

            </div>


            <div>

                <span>
                    Dibayar
                </span>

                <span>
                    ${formatRupiah(
                        transaction.payment
                    )}
                </span>

            </div>


            <div>

                <span>
                    Kembalian
                </span>

                <span>
                    ${formatRupiah(
                        transaction.change
                    )}
                </span>

            </div>

        </div>

    `;


    document.getElementById(
        "detailModal"
    ).classList.add(
        "show"
    );

}


function closeDetailModal() {

    document.getElementById(
        "detailModal"
    ).classList.remove(
        "show"
    );

}


/* =====================================================
   PRINT RECEIPT
===================================================== */

function printReceipt() {

    if (
        !selectedTransaction
    )
        return;


    const transaction =
        selectedTransaction;


    const receipt =
        document.getElementById(
            "transactionDetail"
        ).innerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=500,height=700"
        );


    printWindow.document.write(`

        <html>

        <head>

            <title>
                ${transaction.id}
            </title>

            <style>

                body {
                    font-family: monospace;
                    padding: 25px;
                }

                .receipt-title {
                    text-align:center;
                }

                .receipt-info {
                    border-bottom:1px dashed #999;
                    padding-bottom:10px;
                    margin-bottom:10px;
                    font-size:12px;
                }

                .receipt-item {
                    display:flex;
                    justify-content:space-between;
                    font-size:12px;
                    margin-bottom:7px;
                }

                .receipt-total {
                    border-top:1px dashed #999;
                    margin-top:10px;
                    padding-top:10px;
                }

                .receipt-total div {
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:6px;
                    font-size:12px;
                }

                .receipt-grand {
                    font-weight:bold;
                }

            </style>

        </head>


        <body>

            ${receipt}

            <br>

            <center>
                Terima kasih 🙏
            </center>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.print();

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    let revenue = 0;

    let itemCount = 0;


    transactions.forEach(
        transaction => {

            revenue +=
                transaction.total;

            itemCount +=
                transaction.itemCount;

        }
    );


    const lowStockProducts =
        products.filter(
            product =>
                product.stock <= 5
        );


    document.getElementById(
        "dashboardRevenue"
    ).textContent =
        formatRupiah(
            revenue
        );


    document.getElementById(
        "dashboardTransactions"
    ).textContent =
        transactions.length;


    document.getElementById(
        "dashboardItems"
    ).textContent =
        itemCount;


    document.getElementById(
        "dashboardLowStock"
    ).textContent =
        lowStockProducts.length;


    renderBestSelling();

    renderRecentTransactions();

    renderDashboardStock();

    drawSalesChart();

}


/* =====================================================
   BEST SELLING
===================================================== */

function renderBestSelling() {

    const container =
        document.getElementById(
            "bestSellingList"
        );


    const sales = {};


    transactions.forEach(
        transaction => {

            transaction.items.forEach(
                item => {

                    if (
                        !sales[item.name]
                    ) {

                        sales[item.name] =
                            0;

                    }


                    sales[item.name] +=
                        item.quantity;

                }
            );

        }
    );


    const sorted =
        Object.entries(
            sales
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            5
        );


    if (
        sorted.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada data penjualan.
            </div>
        `;

        return;

    }


    container.innerHTML =
        sorted.map(
            (item, index) => {

                return `

                    <div class="ranking-item">

                        <div class="rank-left">

                            <div class="rank-number">
                                ${index + 1}
                            </div>

                            <div class="rank-name">
                                ${item[0]}
                            </div>

                        </div>

                        <div class="rank-quantity">
                            ${item[1]} unit
                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   RECENT TRANSACTIONS
===================================================== */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (
        transactions.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada transaksi.
            </div>
        `;

        return;

    }


    container.innerHTML =
        transactions
            .slice(
                0,
                5
            )
            .map(
                transaction => {

                    return `

                        <div class="recent-item">

                            <div>

                                <div class="recent-id">
                                    ${transaction.id}
                                </div>

                                <div class="recent-date">
                                    ${formatDate(
                                        transaction.date
                                    )}
                                </div>

                            </div>


                            <div class="recent-total">
                                ${formatRupiah(
                                    transaction.total
                                )}
                            </div>

                        </div>

                    `;

                }
            ).join("");

}


/* =====================================================
   STOCK
===================================================== */

function renderDashboardStock() {

    const container =
        document.getElementById(
            "dashboardStock"
        );


    const lowStock =
        products.filter(
            product =>
                product.stock <= 5
        );


    if (
        lowStock.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Semua stok dalam kondisi aman.
            </div>
        `;

        return;

    }


    container.innerHTML =
        lowStock
            .map(
                product => {

                    return `

                        <div class="stock-item">

                            <div class="stock-name">
                                ${product.name}
                            </div>

                            <div class="stock-value">
                                ${product.stock} tersisa
                            </div>

                        </div>

                    `;

                }
            ).join("");

}


/* =====================================================
   SALES CHART
===================================================== */

function drawSalesChart() {

    const canvas =
        document.getElementById(
            "salesChart"
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        rect.width *
        dpr;


    canvas.height =
        rect.height *
        dpr;


    ctx.scale(
        dpr,
        dpr
    );


    const width =
        rect.width;


    const height =
        rect.height;


    const padding = 40;


    const data = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() -
            i
        );


        const key =
            date
                .toISOString()
                .split("T")[0];


        let total = 0;


        transactions.forEach(
            transaction => {

                if (
                    transaction.date
                        .split("T")[0] ===
                    key
                ) {

                    total +=
                        transaction.total;

                }

            }
        );


        data.push({

            label:
                date.toLocaleDateString(
                    "id-ID",
                    {
                        day: "2-digit",
                        month: "short"
                    }
                ),

            value:
                total

        });

    }


    const max =
        Math.max(
            ...data.map(
                d =>
                    d.value
            ),
            100000
        );


    /* CLEAR */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* GRID */

    ctx.strokeStyle =
        getComputedStyle(
            document.body
        )
        .getPropertyValue(
            "--border"
        );


    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                height -
                padding * 2
            ) *
            i /
            4;


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width -
                padding,
            y
        );

        ctx.stroke();

    }


    /* LINE */

    ctx.beginPath();


    data.forEach(
        (point, index) => {

            const x =
                padding +
                (
                    width -
                    padding * 2
                ) *
                index /
                (
                    data.length -
                    1
                );


            const y =
                height -
                padding -
                (
                    point.value /
                    max
                ) *
                (
                    height -
                    padding * 2
                );


            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#2563eb";


    ctx.lineWidth = 3;

    ctx.stroke();


    /* POINTS */

    data.forEach(
        (point, index) => {

            const x =
                padding +
                (
                    width -
                    padding * 2
                ) *
                index /
                (
                    data.length -
                    1
                );


            const y =
                height -
                padding -
                (
                    point.value /
                    max
                ) *
                (
                    height -
                    padding * 2
                );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#2563eb";

            ctx.fill();


            ctx.fillStyle =
                getComputedStyle(
                    document.body
                )
                .getPropertyValue(
                    "--muted"
                );


            ctx.font =
                "10px Arial";


            ctx.textAlign =
                "center";


            ctx.fillText(
                point.label,
                x,
                height -
                    15
            );

        }
    );

}


/* =====================================================
   EXPORT CSV
===================================================== */

function exportTransactions() {

    if (
        transactions.length === 0
    ) {

        alert(
            "Belum ada transaksi."
        );

        return;

    }


    const header = [

        "Transaction ID",

        "Date",

        "Items",

        "Subtotal",

        "Discount",

        "Tax",

        "Total",

        "Payment",

        "Change",

        "Method"

    ];


    const rows =
        transactions.map(
            transaction => [

                transaction.id,

                formatDate(
                    transaction.date
                ),

                transaction.itemCount,

                transaction.subtotal,

                transaction.discount,

                transaction.tax,

                transaction.total,

                transaction.payment,

                transaction.change,

                transaction.method

            ]
        );


    const csv = [

        header,

        ...rows

    ]
    .map(
        row =>
            row.join(",")
    )
    .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "smartpos_transactions.csv";


    link.click();


    URL.revokeObjectURL(
        url
    );

}


/* =====================================================
   WINDOW EVENTS
===================================================== */

window.addEventListener(
    "resize",
    () => {

        const dashboard =
            document.getElementById(
                "dashboard"
            );


        if (
            dashboard.classList.contains(
                "active-page"
            )
        ) {

            drawSalesChart();

        }

    }
);


/* =====================================================
   INITIALIZATION
===================================================== */

function init() {

    loadDarkMode();

    renderCurrentDate();

    renderCategories();

    renderPOSProducts();

    renderCart();

    renderProductTable();

    renderTransactions();

    renderDashboard();

}


init();