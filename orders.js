// Orders Management JavaScript
let currentView = 'cards'; // 'cards' or 'table'

document.addEventListener('DOMContentLoaded', function() {
  initOrdersPage();
});

function initOrdersPage() {
  loadOrdersStats();
  loadOrdersList();
  
  // Event listeners
  document.getElementById('orderSearch').addEventListener('input', loadOrdersList);
  document.getElementById('statusFilter').addEventListener('change', loadOrdersList);
}

function loadOrdersStats() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.reduce((sum, o) => sum + (o.totals ? o.totals.total : 0), 0)
  };
  
  document.getElementById('totalOrdersCount').textContent = stats.total;
  document.getElementById('pendingOrdersCount').textContent = stats.pending;
  document.getElementById('shippedOrdersCount').textContent = stats.shipped;
  document.getElementById('totalRevenueAmount').textContent = `€${stats.revenue.toFixed(0)}`;
}

function loadOrdersList() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  
  // Filter orders
  let filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm) ||
      (order.customer.firstName || '').toLowerCase().includes(searchTerm) ||
      (order.customer.lastName || '').toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort by date (newest first)
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Update counter
  document.getElementById('orderCount').textContent = `${filteredOrders.length} bestellingen`;
  
  if (currentView === 'cards') {
    loadOrdersCards(filteredOrders, orders);
  } else {
    loadOrdersTable(filteredOrders, orders);
  }
}

function loadOrdersCards(filteredOrders, allOrders) {
  const ordersList = document.getElementById('ordersList');
  
  if (filteredOrders.length === 0) {
    ordersList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
        <h3>🔍 Geen bestellingen gevonden</h3>
        <p>Er zijn geen bestellingen die voldoen aan de huidige filters.</p>
        ${allOrders.length === 0 ? '<p><em>Er zijn nog geen bestellingen geplaatst.</em></p>' : ''}
      </div>
    `;
    return;
  }
  
  const ordersHTML = filteredOrders.map(order => createOrderHTML(order)).join('');
  ordersList.innerHTML = ordersHTML;
}

function loadOrdersTable(filteredOrders, allOrders) {
  const tableBody = document.getElementById('ordersTableBody');
  
  if (filteredOrders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
          <strong>🔍 Geen bestellingen gevonden</strong><br>
          Er zijn geen bestellingen die voldoen aan de huidige filters.
          ${allOrders.length === 0 ? '<br><em>Er zijn nog geen bestellingen geplaatst.</em>' : ''}
        </td>
      </tr>
    `;
    return;
  }
  
  const tableHTML = filteredOrders.map(order => createOrderTableRow(order)).join('');
  tableBody.innerHTML = tableHTML;
}

function createOrderHTML(order) {
  const statusClass = `status-${order.status}`;
  const statusNames = {
    'pending': 'Te Verwerken',
    'confirmed': 'Bevestigd',
    'shipped': 'Verzonden',
    'delivered': 'Geleverd',
    'cancelled': 'Geannuleerd'
  };
  
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <div class="order-item">
      <div class="order-header">
        <div>
          <div class="order-id">${order.id}</div>
          <div class="order-date">${formattedDate}</div>
        </div>
        <div class="order-status ${statusClass}">
          ${statusNames[order.status] || order.status}
        </div>
      </div>
      
      <div class="order-details">
        <div class="detail-section">
          <h4>👤 Klantgegevens</h4>
          <strong>${order.customer.firstName || ''} ${order.customer.lastName || ''}</strong><br>
          📧 ${order.customer.email}<br>
          ${order.customer.address ? `📍 ${order.customer.address}` : ''}
        </div>
        
        <div class="detail-section">
          <h4>🛒 Bestelling (${order.items.length} items)</h4>
          ${order.items.slice(0, 3).map(item => `
            <div style="margin-bottom: 8px;">
              <strong>${item.artist}</strong> - ${item.title}<br>
              <small>${item.format} • €${item.price.toFixed(2)} × ${item.quantity}</small>
            </div>
          `).join('')}
          ${order.items.length > 3 ? `<small><em>... en ${order.items.length - 3} meer</em></small>` : ''}
        </div>
        
        <div class="detail-section">
          <h4>📦 Verzending</h4>
          <strong>${order.shipping.destination}</strong><br>
          Kosten: ${order.shipping.isFree ? 'GRATIS' : '€' + order.shipping.cost.toFixed(2)}<br>
          Gewicht: ${order.shipping.weight.toFixed(2)} kg<br>
          ${order.trackingNumber ? `📋 Track: ${order.trackingNumber}` : '<em>Nog geen tracking</em>'}
        </div>
      </div>
      
      <div class="order-total">
        Totaal: €${order.totals.total.toFixed(2)}
      </div>
      
      <div class="order-actions">
        <button class="btn btn-primary" onclick="changeOrderStatus('${order.id}')">
          📝 Status Wijzigen
        </button>
        <button class="btn btn-secondary" onclick="addTrackingNumber('${order.id}')">
          📋 Tracking Toevoegen
        </button>
        <button class="btn btn-warning" onclick="printOrderLabel('${order.id}')">
          🏷️ Label Printen
        </button>
        <button class="btn btn-success" onclick="viewOrderDetails('${order.id}')">
          👁️ Details Bekijken
        </button>
        <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">
          🗑️ Verwijderen
        </button>
      </div>
    </div>
  `;
}

function createOrderTableRow(order) {
  const statusClass = `status-${order.status}`;
  const statusNames = {
    'pending': 'Te Verwerken',
    'confirmed': 'Bevestigd',
    'shipped': 'Verzonden',
    'delivered': 'Geleverd',
    'cancelled': 'Geannuleerd'
  };
  
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim();
  const itemsPreview = order.items.slice(0, 2).map(item => `${item.artist} - ${item.title}`).join('<br>');
  const moreItems = order.items.length > 2 ? `<br><small>+${order.items.length - 2} meer</small>` : '';
  
  return `
    <tr>
      <td class="table-order-id">${order.id}</td>
      <td class="table-customer">
        <strong>${customerName || 'Onbekend'}</strong>
        <small>${order.customer.email}</small>
      </td>
      <td class="table-items">
        <div class="table-items-count">${order.items.length} items</div>
        ${itemsPreview}${moreItems}
      </td>
      <td>
        <span class="order-status ${statusClass}">
          ${statusNames[order.status] || order.status}
        </span>
      </td>
      <td class="table-total">€${order.totals.total.toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td class="table-actions">
        <button class="btn btn-primary" onclick="changeOrderStatus('${order.id}')" title="Status wijzigen">📝</button>
        <button class="btn btn-secondary" onclick="addTrackingNumber('${order.id}')" title="Tracking toevoegen">📋</button>
        <button class="btn btn-warning" onclick="printOrderLabel('${order.id}')" title="Label printen">🏷️</button>
        <button class="btn btn-success" onclick="viewOrderDetails('${order.id}')" title="Details bekijken">👁️</button>
        <button class="btn btn-danger" onclick="deleteOrder('${order.id}')" title="Verwijderen">🗑️</button>
      </td>
    </tr>
  `;
}

function toggleView() {
  const toggleBtn = document.getElementById('viewToggleBtn');
  const ordersList = document.getElementById('ordersList');
  const ordersTable = document.getElementById('ordersTable');
  
  if (currentView === 'cards') {
    // Switch to table view
    currentView = 'table';
    toggleBtn.textContent = '📋 Kaartweergave';
    ordersList.classList.add('view-hidden');
    ordersTable.classList.remove('view-hidden');
  } else {
    // Switch to cards view
    currentView = 'cards';
    toggleBtn.textContent = '📋 Lijstweergave';
    ordersList.classList.remove('view-hidden');
    ordersTable.classList.add('view-hidden');
  }
  
  // Reload orders in new view
  loadOrdersList();
}

function refreshOrders() {
  loadOrdersStats();
  loadOrdersList();
  showNotification('Bestellingen vernieuwd!', 'success');
}

function changeOrderStatus(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) return;
  
  const statuses = [
    { value: 'pending', label: 'Te Verwerken' },
    { value: 'confirmed', label: 'Bevestigd' },
    { value: 'shipped', label: 'Verzonden' },
    { value: 'delivered', label: 'Geleverd' },
    { value: 'cancelled', label: 'Geannuleerd' }
  ];
  
  const currentStatusLabel = statuses.find(s => s.value === order.status)?.label || order.status;
  
  const newStatus = prompt(`Status wijzigen voor ${orderId}:\n\n` + 
    statuses.map((s, i) => `${i + 1}. ${s.label}`).join('\n') + 
    `\n\nHuidige status: ${currentStatusLabel}\n\nVoer nummer in (1-5):`);
  
  if (newStatus && !isNaN(newStatus)) {
    const statusIndex = parseInt(newStatus) - 1;
    if (statusIndex >= 0 && statusIndex < statuses.length) {
      order.status = statuses[statusIndex].value;
      
      // Add tracking for shipped orders
      if (order.status === 'shipped' && !order.trackingNumber) {
        const tracking = prompt('Voer tracking nummer in (optioneel):');
        if (tracking && tracking.trim()) {
          order.trackingNumber = tracking.trim();
        }
      }
      
      localStorage.setItem('orders', JSON.stringify(orders));
      refreshOrders();
      showNotification(`Status bijgewerkt naar: ${statuses[statusIndex].label}`, 'success');
    }
  }
}

function addTrackingNumber(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) return;
  
  const currentTracking = order.trackingNumber || '';
  const newTracking = prompt(`Tracking nummer voor ${orderId}:\n\nHuidig: ${currentTracking || 'Geen tracking'}\n\nVoer nieuw tracking nummer in:`, currentTracking);
  
  if (newTracking !== null) {
    order.trackingNumber = newTracking.trim() || null;
    localStorage.setItem('orders', JSON.stringify(orders));
    refreshOrders();
    showNotification('Tracking nummer bijgewerkt!', 'success');
  }
}

function printOrderLabel(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) return;
  
  // Create printable label
  const labelWindow = window.open('', '_blank');
  labelWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verzendlabel - ${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .section { margin-bottom: 15px; line-height: 1.4; }
        .tracking { font-size: 1.2em; font-weight: bold; text-align: center; margin-top: 15px; padding: 10px; background: #f0f0f0; }
        .barcode { text-align: center; margin-top: 10px; font-family: monospace; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="header">
          <h2>DOCTOR VINYL RECORDS</h2>
          <p>Groot Eiland 1, 1000 Brussels<br>+32 476 71 75 40</p>
        </div>
        
        <div class="section">
          <strong>VERZENDEN NAAR:</strong><br>
          ${order.customer.firstName || ''} ${order.customer.lastName || ''}<br>
          ${order.customer.address || 'Adres ontbreekt'}<br>
          📧 ${order.customer.email}
        </div>
        
        <div class="section">
          <strong>BESTELLING:</strong> ${order.id}<br>
          <strong>DATUM:</strong> ${new Date(order.createdAt).toLocaleDateString('nl-BE')}<br>
          <strong>GEWICHT:</strong> ${order.shipping.weight.toFixed(2)} kg<br>
          <strong>VERZENDKOSTEN:</strong> €${order.shipping.cost.toFixed(2)}<br>
          <strong>BESTEMMING:</strong> ${order.shipping.destination}
        </div>
        
        <div class="section">
          <strong>INHOUD:</strong><br>
          ${order.items.map(item => `• ${item.artist} - ${item.title} (${item.quantity}x)`).join('<br>')}
        </div>
        
        ${order.trackingNumber ? `
          <div class="tracking">
            TRACKING: ${order.trackingNumber}
            <div class="barcode">||||| ${order.trackingNumber} |||||</div>
          </div>
        ` : ''}
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        }
      </script>
    </body>
    </html>
  `);
  labelWindow.document.close();
}

function viewOrderDetails(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) return;
  
  const detailsWindow = window.open('', '_blank', 'width=800,height=600');
  detailsWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Details - ${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .item { padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; }
        .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bestelling ${order.id}</h1>
        <p><strong>Datum:</strong> ${new Date(order.createdAt).toLocaleString('nl-BE')}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      
      <div class="section">
        <h3>👤 Klantgegevens</h3>
        <p><strong>Naam:</strong> ${order.customer.firstName || ''} ${order.customer.lastName || ''}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Adres:</strong> ${order.customer.address || 'Niet opgegeven'}</p>
      </div>
      
      <div class="section">
        <h3>🛒 Bestelde Items</h3>
        <table>
          <thead>
            <tr>
              <th>Artist</th>
              <th>Titel</th>
              <th>Format</th>
              <th>Prijs</th>
              <th>Aantal</th>
              <th>Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.artist}</td>
                <td>${item.title}</td>
                <td>${item.format}</td>
                <td>€${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>€${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h3>📦 Verzending</h3>
        <p><strong>Bestemming:</strong> ${order.shipping.destination}</p>
        <p><strong>Gewicht:</strong> ${order.shipping.weight.toFixed(2)} kg</p>
        <p><strong>Verzendkosten:</strong> ${order.shipping.isFree ? 'GRATIS' : '€' + order.shipping.cost.toFixed(2)}</p>
        ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
      </div>
      
      <div class="section">
        <h3>💰 Totalen</h3>
        <p><strong>Subtotaal:</strong> €${order.totals.subtotal.toFixed(2)}</p>
        <p><strong>Verzendkosten:</strong> €${order.totals.shipping.toFixed(2)}</p>
        <div class="total">Totaal: €${order.totals.total.toFixed(2)}</div>
      </div>
      
      <script>
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            window.close();
          }
        });
      </script>
    </body>
    </html>
  `);
  detailsWindow.document.close();
}

function deleteOrder(orderId) {
  if (!confirm(`Weet je zeker dat je bestelling ${orderId} wilt verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.`)) {
    return;
  }
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const filteredOrders = orders.filter(order => order.id !== orderId);
  
  localStorage.setItem('orders', JSON.stringify(filteredOrders));
  refreshOrders();
  showNotification(`Bestelling ${orderId} is verwijderd.`, 'success');
}

function printAllLabels() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'confirmed');
  
  if (pendingOrders.length === 0) {
    alert('Geen bestellingen om labels voor te printen.');
    return;
  }
  
  if (!confirm(`${pendingOrders.length} labels printen voor alle te verwerken bestellingen?`)) {
    return;
  }
  
  pendingOrders.forEach((order, index) => {
    setTimeout(() => printOrderLabel(order.id), index * 500);
  });
}

function exportOrdersToCSV() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  if (orders.length === 0) {
    alert('Geen bestellingen om te exporteren.');
    return;
  }
  
  // CSV headers
  const csvHeaders = [
    'Bestelnummer',
    'Datum',
    'Status',
    'Klant Email',
    'Voornaam',
    'Achternaam',
    'Adres',
    'Items Count',
    'Items Details',
    'Subtotaal',
    'Verzendkosten',
    'Totaal',
    'Bestemming',
    'Gewicht',
    'Tracking'
  ];
  
  // CSV data
  const csvData = orders.map(order => [
    order.id,
    new Date(order.createdAt).toLocaleDateString('nl-BE'),
    order.status,
    order.customer.email,
    order.customer.firstName || '',
    order.customer.lastName || '',
    order.customer.address || '',
    order.items.length,
    order.items.map(item => `${item.artist} - ${item.title} (${item.quantity}x €${item.price})`).join('; '),
    order.totals.subtotal.toFixed(2),
    order.totals.shipping.toFixed(2),
    order.totals.total.toFixed(2),
    order.shipping.destination,
    order.shipping.weight.toFixed(2),
    order.trackingNumber || ''
  ]);
  
  // Create CSV content
  const csvContent = [csvHeaders, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `doctor-vinyl-orders-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Orders geëxporteerd naar CSV!', 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.opacity = '1', 10);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}
