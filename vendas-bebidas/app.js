// Dados
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let currentSale = [];

// Salvar no LocalStorage
function save() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sales', JSON.stringify(sales));
}

// Feedback Visual
function showMessage(message) {
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.className = 'message';
    document.getElementById('message-container').appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// ---------------- Página de Venda ---------------- //

if (document.getElementById('product-list')) {
    renderProducts();
    renderCart();
}

function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <h3>${p.name}</h3>
            <div class="price">R$ ${p.price.toFixed(2)}</div>
            <div class="buttons">
                <button onclick="addToCart(${index})">➕</button>
                <button onclick="editProduct(${index})">📝</button>
            </div>
        `;
        productList.appendChild(div);
    });
}

function createProduct() {
    const name = prompt('Nome do produto:');
    const price = parseFloat(prompt('Preço do produto:'));
    if (name && !isNaN(price)) {
        products.push({ name, price });
        save();
        renderProducts();
        showMessage('Produto criado ✔️');
    }
}

function editProduct(index) {
    const action = prompt('Digite "1" para editar ou "2" para excluir o produto:');
    if (action === '1') {
        const name = prompt('Novo nome:', products[index].name);
        const price = parseFloat(prompt('Novo preço:', products[index].price));
        if (name && !isNaN(price)) {
            products[index] = { name, price };
            save();
            renderProducts();
            showMessage('Produto atualizado ✔️');
        }
    } else if (action === '2') {
        if (confirm('Deseja realmente excluir este produto?')) {
            products.splice(index, 1);
            save();
            renderProducts();
            showMessage('Produto excluído ✔️');
        }
    }
}

function addToCart(index) {
    const quantity = parseInt(prompt('Quantidade:', 1)) || 1;
    const note = prompt('Observações (opcional):', '') || '';
    for (let i = 0; i < quantity; i++) {
        currentSale.push({ ...products[index], note });
    }
    renderCart();
    showMessage('Produto adicionado ✔️');
}

function removeFromCart(index) {
    currentSale.splice(index, 1);
    renderCart();
    showMessage('Produto removido ✔️');
}

function renderCart() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return;
    cartList.innerHTML = '';
    currentSale.forEach((p, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            ${p.name} ${p.note ? `(${p.note})` : ''} - R$ ${p.price.toFixed(2)}
            <button onclick="removeFromCart(${index})">➖</button>
        `;
        cartList.appendChild(li);
    });
}

function finalizeSale() {
    if (currentSale.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    const now = new Date();
    const timestamp = now.toLocaleString();

    sales.push({
        items: [...currentSale],
        date: timestamp
    });

    printTicket(currentSale, timestamp);

    currentSale = [];
    save();
    renderCart();
    showMessage('Venda finalizada ✔️');
}

// Ticket Impressão
function printTicket(sale, timestamp) {
    const win = window.open('./print/ticket.html');
    win.onload = () => {
        const ticketContent = win.document.getElementById('ticket-content');
        ticketContent.innerHTML = `<h2>Ticket</h2><div>Data: ${timestamp}</div>`;
        sale.forEach(item => {
            const div = win.document.createElement('div');
            div.textContent = `${item.name}${item.note ? ` (${item.note})` : ''} - R$ ${item.price.toFixed(2)}`;
            ticketContent.appendChild(div);
        });
        const total = sale.reduce((sum, p) => sum + p.price, 0);
        const totalDiv = win.document.createElement('div');
        totalDiv.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
        ticketContent.appendChild(totalDiv);

        win.print();
    };
}

// ---------------- Página Histórico ---------------- //

if (document.getElementById('history-list')) {
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    const totalSales = document.getElementById('total-sales');
    historyList.innerHTML = '';

    let grandTotal = 0;

    sales.forEach((sale, index) => {
        const total = sale.items.reduce((sum, p) => sum + p.price, 0);
        grandTotal += total;

        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Venda ${index + 1}</strong><br>
            Data: ${sale.date}<br>
            Itens: ${sale.items.map(p => `${p.name}${p.note ? ` (${p.note})` : ''}`).join(', ')}<br>
            Total: R$ ${total.toFixed(2)}
        `;
        historyList.appendChild(li);
    });

    totalSales.textContent = `Total Geral: R$ ${grandTotal.toFixed(2)}`;
}

function printHistory() {
    window.print();
}
