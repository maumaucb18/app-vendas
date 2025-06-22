let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let currentSale = JSON.parse(localStorage.getItem('currentSale')) || [];
sales = Array.isArray(sales) ? sales : [];
products = Array.isArray(products) ? products : [];


// função auxiliar para prevenir erros
function safeParse(json) {
    try {
        return JSON.parse(json) || [];
    } catch (e) {
        console.error('Erro ao analisar JSON:', e);
        return [];
    }
}
// Função para salvar dados
function save() {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sales', JSON.stringify(sales));
        localStorage.setItem('currentSale', JSON.stringify(currentSale));
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
        showMessage('Erro ao salvar dados!');
    }
}

// Feedback visual
function showMessage(message) {
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.className = 'message';
    document.getElementById('message-container').appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// ---------------- Página Vendas ---------------- //

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
                <button onclick="addToCart(${index})">Adicionar</button>
                <button onclick="editProduct(${index})">Editar</button>
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
    const action = prompt('Digite "1" para editar ou "2" para excluir:');
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
        if (confirm('Deseja excluir este produto?')) {
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
    let total = 0;

    currentSale.forEach((p, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            ${p.name} ${p.note ? `(${p.note})` : ''} - R$ ${p.price.toFixed(2)}
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartList.appendChild(li);
        total += p.price;
    });
    if (currentSale.length > 0) {
        const totalLi = document.createElement('li');
        totalLi.className = 'cart-item total';
        totalLi.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
        cartList.appendChild(totalLi);
    }
}

function finalizeSale() {
    if (currentSale.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    const now = new Date();
    const timestamp = now.toLocaleString();

    const saleRecord = {
        items: [...currentSale],
        date: timestamp
    };

    sales.push(saleRecord);

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

    if (!sales || sales.length === 0) {
        historyList.innerHTML = '<li>Sem vendas registradas.</li>';
        totalSales.textContent = 'Total Geral: R$ 0,00';
        return;
    }

    sales.forEach((sale, index) => {
        // Verifica se sale e sale.items existem
        const items = Array.isArray(sale.items) ? sale.items : [];

        const total = items.reduce((sum, p) => sum + (p.price || 0), 0);
        grandTotal += total;

        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Venda ${index + 1}</strong><br>
            Data: ${sale.date || 'Data não registrada'}<br>
            Itens: ${items.map(p => `${p.name}${p.note ? ` (${p.note})` : ''}`).join(', ') || 'Nenhum item'}<br>
            Total: R$ ${total.toFixed(2)}
        `;
        historyList.appendChild(li);
    });

    totalSales.textContent = `Total Geral: R$ ${grandTotal.toFixed(2)}`;
}



function printHistory() {
    window.print();
}
// Adicionar registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registrado!'))
            .catch(err => console.error('Erro SW:', err));
    });
}
// função auxiliar para o carregamento inicial:
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('product-list')) {
        renderProducts();
        renderCart();
    }

    if (document.getElementById('history-list')) {
        renderHistory();
    }
});
// função para excluir vendas no histórico:
function deleteSale(index) {
    if (confirm('Excluir esta venda do histórico?')) {
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        
        if (index >= 0 && index < sales.length) {
            sales.splice(index, 1);
            localStorage.setItem('sales', JSON.stringify(sales));
            renderHistory();
            showMessage('Venda excluída ✔️');
        }
    }
}