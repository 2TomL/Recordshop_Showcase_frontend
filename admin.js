// --- Admin User Management ---
// (from app.js)
// --- Admin User Management: Add/Edit logic (admin-users.html) ---
if (document.getElementById('adminUserForm')) {
  // User management uitgeschakeld voor portfolio: geen gebruikers opslaan of bewerken
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminUserForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Gebruikersbeheer is uitgeschakeld in deze portfolio demo.');
      });
    }
    const editIndex = document.getElementById('adminUserEditIndex');
    const cancelBtn = document.getElementById('adminUserCancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (form) form.reset();
        if (editIndex) editIndex.value = '';
        document.getElementById('adminUserSaveBtn').textContent = 'Add User';
      });
    }
  });
}
// --- Admin User Management (admin-users.html) ---
function renderAdminUsersList(filter = '') {
  const usersList = document.getElementById('adminUsersList');
  if (!usersList) return;
  let users = JSON.parse(localStorage.getItem('users') || '{}');
  let userArr = Object.entries(users).map(([username, u]) => ({ username, ...u }));
  if (filter) {
    userArr = userArr.filter(u =>
      u.username.toLowerCase().includes(filter.toLowerCase()) ||
      (u.firstName && u.firstName.toLowerCase().includes(filter.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(filter.toLowerCase()))
    );
  }
  usersList.innerHTML = '';
  if (userArr.length === 0) {
    usersList.innerHTML = '<div class="empty-admin-message">No accounts found.</div>';
    return;
  }
  // Header
  const header = document.createElement('div');
  header.className = 'admin-records-row admin-records-header';
  header.innerHTML = `
    <div style="flex:1">Username</div>
    <div style="flex:1">Name</div>
    <div style="flex:1">First Name</div>
    <div style="flex:1">Street</div>
    <div style="flex:0.7">Nr</div>
    <div style="flex:0.7">App.</div>
    <div style="flex:0.7">Postal</div>
    <div style="flex:1">City</div>
    <div style="flex:1">Country</div>
    <div style="flex:0.7">Role</div>
    <div style="flex:0.7">Delete</div>
  `;
  usersList.appendChild(header);
  userArr.forEach(u => {
    const div = document.createElement('div');
    div.className = 'admin-records-row';
    div.innerHTML = `
      <div style="flex:1">${u.username}</div>
      <div style="flex:1">${u.lastName || ''}</div>
      <div style="flex:1">${u.firstName || ''}</div>
      <div style="flex:1">${u.street || ''}</div>
      <div style="flex:0.7">${u.number || ''}</div>
      <div style="flex:0.7">${u.app || ''}</div>
      <div style="flex:0.7">${u.postal || ''}</div>
      <div style="flex:1">${u.city || ''}</div>
      <div style="flex:1">${u.country || ''}</div>
      <div style="flex:0.7">${u.role || 'user'}</div>
      <div style="flex:0.7">
        <button class="admin-user-edit-btn" data-edituser="${u.username}">Edit</button>
        <button class="admin-user-del-btn" data-deluser="${u.username}">Delete</button>
      </div>
    `;
    usersList.appendChild(div);
  });
  // Delete logic
  usersList.querySelectorAll('.admin-user-del-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const username = this.getAttribute('data-deluser');
      if (confirm('Delete this account?')) {
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        delete users[username];
        localStorage.setItem('users', JSON.stringify(users));
        renderAdminUsersList(document.getElementById('adminUserSearch')?.value || '');
      }
    });
  });
}
// Only run on admin-users.html
if (document.getElementById('adminUsersList')) {
  document.addEventListener('DOMContentLoaded', function() {
    renderAdminUsersList();
    const search = document.getElementById('adminUserSearch');
    if (search) {
      search.addEventListener('input', function() {
        renderAdminUsersList(this.value);
      });
    }
  });
}
// Open User Management page from admin panel
document.addEventListener('DOMContentLoaded', function() {
  var openUserBtn = document.getElementById('openUserManagementBtn');
  if (openUserBtn) {
    openUserBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.open('admin-users.html', '_blank');
    });
  }
});

// --- Admin Specials Management ---
// --- Specials Grid rendering ---
const specialsGrid = document.getElementById('specialsGrid');

function renderSpecialsGrid() {
  if (!specialsGrid) return;
  specialsGrid.innerHTML = '';
  if (specials.length === 0) {
    specialsGrid.innerHTML = '<div class="empty-grid-message">Geen specials gevonden</div>';
    return;
  }
  specials.forEach(sp => {
    const div = document.createElement('div');
    div.className = 'record-card';
    div.innerHTML = `
      <img src="${sp.img || 'assets/Logo-DV1.png'}" alt="${sp.title}">
      <div class="record-card-info">
        <div class="record-title">${sp.title}</div>
        <div class="record-artist">${sp.desc || ''}</div>
        <div class="record-price">
          ${sp.sale && sp.salePrice ? `<img src='assets/iconssales.png' alt='Sale' class='card-sale-icon ani ani6'> €${parseFloat(sp.salePrice).toFixed(2)} <span class='sale-old-price'>€${parseFloat(sp.price).toFixed(2)}</span>` : `€${parseFloat(sp.price).toFixed(2)}`}
        </div>
      </div>
    `;
    // Add button separately to avoid quote issues
    const addButton = document.createElement('button');
    addButton.className = 'record-add';
    addButton.textContent = 'Add to cart';
    addButton.setAttribute('data-i18n', 'add_to_cart');
    addButton.onclick = function() {
      addToCart(sp.title, parseFloat(sp.price), sp.img || '', 'special');
    };
    div.querySelector('.record-card-info').appendChild(addButton);
    specialsGrid.appendChild(div);
  });
}
// --- Admin: specials beheer ---
let specials = JSON.parse(localStorage.getItem('specials') || '[]');
const adminSpecialsList = document.getElementById('adminSpecialsList');
const adminSpecialForm = document.getElementById('adminSpecialForm');

function saveSpecials() {
  localStorage.setItem('specials', JSON.stringify(specials));
}

function renderAdminSpecialsList() {
  if (!adminSpecialsList) return;
  adminSpecialsList.innerHTML = '';
  if (specials.length === 0) {
    adminSpecialsList.innerHTML = '<div class="empty-admin-message">Geen specials opgeslagen.</div>';
    return;
  }
  // Header
  const header = document.createElement('div');
  header.className = 'admin-records-row admin-records-header';
  header.innerHTML = `
    <div class="admin-records-photo">Photo</div>
    <div class="admin-records-title">Title</div>
    <div class="admin-records-desc">Description</div>
    <div class="admin-records-price">Price (€)</div>
    <div class="admin-records-sale">Sale?</div>
    <div class="admin-records-saleprice">Sale Price (€)</div>
    <div class="admin-records-actions">Actions</div>
  `;
  adminSpecialsList.appendChild(header);
  specials.forEach((sp, idx) => {
    const div = document.createElement('div');
    div.className = 'admin-records-row';
    div.innerHTML = `
      <div class="admin-records-photo">${sp.img ? `<img src="${sp.img}" alt="${sp.title}" />` : ''}</div>
      <div class="admin-records-title">${sp.title}</div>
      <div class="admin-records-desc">${sp.desc || ''}</div>
      <div class="admin-records-price">${sp.price ? '€' + parseFloat(sp.price).toFixed(2) : ''}</div>
      <div class="admin-records-sale"><input type="checkbox" class="admin-special-sale-checkbox" data-idx="${idx}" ${sp.sale ? 'checked' : ''}></div>
      <div class="admin-records-saleprice"><input type="number" class="admin-special-saleprice-input" data-idx="${idx}" min="0" step="0.01" value="${sp.salePrice ? sp.salePrice : ''}" ${sp.sale ? '' : 'disabled'}></div>
      <div class="admin-records-actions">
        <button data-editsp="${idx}">Edit</button>
        <button data-delsp="${idx}">Delete</button>
      </div>
    `;
    adminSpecialsList.appendChild(div);
  });
  // Sale checkbox logic
  adminSpecialsList.querySelectorAll('.admin-special-sale-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      const idx = this.getAttribute('data-idx');
      specials[idx].sale = this.checked;
      if (this.checked) {
        specials[idx].salePrice = specials[idx].price;
        adminSpecialsList.querySelector(`.admin-special-saleprice-input[data-idx='${idx}']`).disabled = false;
        adminSpecialsList.querySelector(`.admin-special-saleprice-input[data-idx='${idx}']`).value = specials[idx].price;
      } else {
        specials[idx].salePrice = null;
        adminSpecialsList.querySelector(`.admin-special-saleprice-input[data-idx='${idx}']`).value = '';
        adminSpecialsList.querySelector(`.admin-special-saleprice-input[data-idx='${idx}']`).disabled = true;
      }
      saveSpecials();
      renderAdminSpecialsList();
    });
  });
  // Sale price input logic
  adminSpecialsList.querySelectorAll('.admin-special-saleprice-input').forEach(inp => {
    inp.addEventListener('input', function() {
      const idx = this.getAttribute('data-idx');
      specials[idx].salePrice = this.value ? parseFloat(this.value) : null;
      saveSpecials();
      renderSpecialsGrid();
    });
  });
}

if (adminSpecialForm) {
  adminSpecialForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const idx = document.getElementById('adminSpecialEditIndex').value;
    const title = document.getElementById('adminSpecialTitle').value.trim();
    const price = document.getElementById('adminSpecialPrice').value;
    const desc = document.getElementById('adminSpecialDesc').value.trim();
    const photoInput = document.getElementById('adminSpecialPhoto');
    // Required: title, price, photo
    if (!title || !price || (!idx && (!photoInput || !photoInput.files || !photoInput.files[0]))) {
      alert('Vul titel, prijs en foto in.');
      return;
    }
    const handleSpecial = (imgData) => {
      const special = {
        title,
        price: parseFloat(price),
        desc,
        sale: false,
        img: imgData
      };
      if (idx) {
        // Edit
        const old = specials[parseInt(idx)];
        special.sale = old.sale;
        special.img = imgData || old.img;
        specials[parseInt(idx)] = special;
      } else {
        specials.push(special);
      }
      saveSpecials();
      renderAdminSpecialsList();
      renderSpecialsGrid();
      adminSpecialForm.reset();
      document.getElementById('adminSpecialEditIndex').value = '';
      document.getElementById('adminSpecialSaveBtn').textContent = 'Save Special';
      document.getElementById('adminSpecialCancelBtn').style.display = 'none';
    };
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        handleSpecial(ev.target.result);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      handleSpecial(idx ? specials[parseInt(idx)].img : '');
    }
  });

  // Edit/delete logic
  adminSpecialsList.addEventListener('click', function(e) {
    if (e.target.dataset.editsp) {
      const sp = specials[parseInt(e.target.dataset.editsp)];
      document.getElementById('adminSpecialEditIndex').value = e.target.dataset.editsp;
      document.getElementById('adminSpecialTitle').value = sp.title;
      document.getElementById('adminSpecialPrice').value = sp.price;
      document.getElementById('adminSpecialDesc').value = sp.desc || '';
      document.getElementById('adminSpecialSaveBtn').textContent = 'Update Special';
      document.getElementById('adminSpecialCancelBtn').style.display = '';
    } else if (e.target.dataset.delsp) {
      if (confirm('Delete this special?')) {
        specials.splice(parseInt(e.target.dataset.delsp), 1);
        saveSpecials();
        renderAdminSpecialsList();
        renderSpecialsGrid();
        adminSpecialForm.reset();
        document.getElementById('adminSpecialEditIndex').value = '';
        document.getElementById('adminSpecialSaveBtn').textContent = 'Save Special';
        document.getElementById('adminSpecialCancelBtn').style.display = 'none';
      }
    }
  });

  document.getElementById('adminSpecialCancelBtn').addEventListener('click', function() {
    adminSpecialForm.reset();
    document.getElementById('adminSpecialEditIndex').value = '';
    document.getElementById('adminSpecialSaveBtn').textContent = 'Save Special';
    this.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderAdminSpecialsList();
  renderSpecialsGrid();
});

// --- Admin Records Management ---
// --- Admin: platenbeheer met foto upload ---
let records = JSON.parse(localStorage.getItem('records') || '[]');
const adminRecordForm = document.getElementById('adminRecordForm');
const adminRecordsList = document.getElementById('adminRecordsList');
const recordsGrid = document.getElementById('recordsGrid');

function saveRecords() {
  localStorage.setItem('records', JSON.stringify(records));
}

function renderAdminRecordsList(filter = '') {
  if (!adminRecordsList) return;
  adminRecordsList.innerHTML = '';
  let filtered = records.filter(r =>
    (!filter || r.artist.toLowerCase().includes(filter.toLowerCase()) || r.title.toLowerCase().includes(filter.toLowerCase()))
  );
  // Header row
  const header = document.createElement('div');
  header.className = 'admin-records-row admin-records-header';
  header.innerHTML = `
    <div class="admin-records-photo">Photo</div>
    <div class="admin-records-artist">Artist</div>
    <div class="admin-records-title">Title</div>
    <div class="admin-records-catalog">CatalogNr</div>
    <div class="admin-records-qt">Stock</div>
    <div class="admin-records-sale">Sale?</div>
    <div class="admin-records-saleprice">Sale Price (€)</div>
    <div class="admin-records-actions">Actions</div>
  `;
  adminRecordsList.appendChild(header);
  filtered.forEach((rec, idx) => {
    const div = document.createElement('div');
    div.className = 'admin-records-row';
    div.innerHTML = `
      <div class="admin-records-photo">${rec.img ? `<img src="${rec.img}" alt="${rec.title}" />` : ''}</div>
      <div class="admin-records-artist">${rec.artist}</div>
      <div class="admin-records-title">${rec.title}</div>
      <div class="admin-records-catalog">${rec.catalogNr || ''}</div>
      <div class="admin-records-qt">${rec.qt || 0}</div>
      <div class="admin-records-sale"><input type="checkbox" class="admin-sale-checkbox" data-idx="${idx}" ${rec.salePrice ? 'checked' : ''}></div>
      <div class="admin-records-saleprice"><input type="number" class="admin-saleprice-input" data-idx="${idx}" min="0" step="0.01" value="${rec.salePrice ? rec.salePrice : ''}" ${rec.salePrice ? '' : 'disabled'}></div>
      <div class="admin-records-actions">
        <button data-edit="${idx}">Edit</button>
        <button data-del="${idx}">Delete</button>
      </div>
    `;
    adminRecordsList.appendChild(div);
  });
  // Sale checkbox logic
  adminRecordsList.querySelectorAll('.admin-sale-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      const idx = this.getAttribute('data-idx');
      if (this.checked) {
        records[idx].salePrice = records[idx].price;
        adminRecordsList.querySelector(`.admin-saleprice-input[data-idx='${idx}']`).disabled = false;
        adminRecordsList.querySelector(`.admin-saleprice-input[data-idx='${idx}']`).value = records[idx].price;
      } else {
        records[idx].salePrice = null;
        adminRecordsList.querySelector(`.admin-saleprice-input[data-idx='${idx}']`).value = '';
        adminRecordsList.querySelector(`.admin-saleprice-input[data-idx='${idx}']`).disabled = true;
      }
      saveRecords();
      renderRecordsGrid();
    });
  });
  // Sale price input logic
  adminRecordsList.querySelectorAll('.admin-saleprice-input').forEach(inp => {
    inp.addEventListener('input', function() {
      const idx = this.getAttribute('data-idx');
      records[idx].salePrice = this.value ? parseFloat(this.value) : null;
      saveRecords();
      renderRecordsGrid();
    });
  });
}

// --- Admin Orders Management ---
let currentView = 'cards'; // 'cards' or 'table'
function toggleView() {
  const toggleBtn = document.getElementById('viewToggleBtn');
  const ordersList = document.getElementById('ordersList');
  const ordersTable = document.getElementById('ordersTable');
  if (currentView === 'cards') {
    currentView = 'table';
    toggleBtn.textContent = '📋 Kaartweergave';
    ordersList.classList.add('view-hidden');
    ordersTable.classList.remove('view-hidden');
  } else {
    currentView = 'cards';
    toggleBtn.textContent = '📋 Lijstweergave';
    ordersList.classList.remove('view-hidden');
    ordersTable.classList.add('view-hidden');
  }
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
  const csvContent = [csvHeaders, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
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

// --- Admin Clear Storage Tools ---
// ...existing code...

// All admin panel event listeners, rendering, and logic are now in this file.
// Make sure to load this file after app.js and models.js in your HTML.
