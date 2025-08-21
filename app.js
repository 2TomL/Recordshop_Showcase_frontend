// --- Shipping Calculator ---
function calculateShipping(cartItems, destination = 'BE') {
  const totalWeight = cartItems.reduce((weight, item) => {
    // Vinyl records weight by format (in kg)
    const formatWeights = {
      'LP': 0.18,
      'MAXI': 0.15,
      'TWELVE_INCH': 0.15,
      'TEN_INCH': 0.12,
      'SEVEN_INCH': 0.05,
      'FLEXI_DISK': 0.03,
      'OTHER': 0.15
    };
    const itemWeight = formatWeights[item.format] || 0.15;
    return weight + (itemWeight * item.quantity);
  }, 0);
  
  const shippingRates = {
    'BE': { base: 5.95, perKg: 1.50, free: 50, name: 'België' },
    'NL': { base: 7.95, perKg: 2.00, free: 75, name: 'Nederland' },
    'FR': { base: 9.95, perKg: 2.50, free: 75, name: 'Frankrijk' },
    'DE': { base: 8.95, perKg: 2.00, free: 75, name: 'Duitsland' },
    'EU': { base: 12.95, perKg: 3.00, free: 100, name: 'Europa' },
    'WORLD': { base: 24.95, perKg: 5.00, free: 150, name: 'Wereldwijd' }
  };
  
  const rate = shippingRates[destination] || shippingRates['WORLD'];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Free shipping check
  if (subtotal >= rate.free) return { cost: 0, isFree: true, rate: rate };
  
  const cost = rate.base + (totalWeight * rate.perKg);
  return { cost: Math.round(cost * 100) / 100, isFree: false, rate: rate };
}

function getShippingDestination(user) {
  if (!user || !user.country) return 'BE';
  
  const country = user.country.toUpperCase();
  const euCountries = ['AT', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  
  if (country === 'BE') return 'BE';
  if (country === 'NL') return 'NL';
  if (country === 'FR') return 'FR';
  if (country === 'DE') return 'DE';
  if (euCountries.includes(country)) return 'EU';
  
  return 'WORLD';
}

// --- Order Management ---
const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

function createOrder(cartItems, customerInfo, shippingData) {
  // Orders are not saved in portfolio mode
  return null;
}

function getUserOrders(userEmail) {
  // No orders in portfolio mode
  return [];
}

// --- My Account Modal Logic ---
document.addEventListener('DOMContentLoaded', function() {
  const myAccountBtn = document.getElementById('myAccountBtn');
  const myAccountModal = document.getElementById('myAccountModal');
  const closeMyAccountBtn = document.getElementById('closeMyAccountBtn');
  const myAccountForm = document.getElementById('myAccountForm');
  if (!myAccountBtn || !myAccountModal || !myAccountForm) return;

  // Real-time password confirmation validation for My Account
  const myAccountPass = document.getElementById('myAccountPass');
  const myAccountPassConfirm = document.getElementById('myAccountPassConfirm');
  const myAccountError = document.getElementById('myAccountError');
  
  function validateMyAccountPasswords() {
    if (myAccountPass && myAccountPassConfirm && myAccountError) {
      if (myAccountPassConfirm.value && myAccountPass.value !== myAccountPassConfirm.value) {
        myAccountError.textContent = 'Wachtwoorden komen niet overeen.';
        myAccountError.style.color = '#e63946';
      } else {
        myAccountError.textContent = '';
      }
    }
  }
  
  if (myAccountPass && myAccountPassConfirm) {
    myAccountPass.addEventListener('input', validateMyAccountPasswords);
    myAccountPassConfirm.addEventListener('input', validateMyAccountPasswords);
  }

  myAccountModal.classList.remove('open');

  // Show button if logged in
  function updateMyAccountBtn() {
    const currentUser = localStorage.getItem('currentUser');
    const myAccountBtnMobile = document.getElementById('myAccountBtnMobile');
    
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const user = users[currentUser];
      const isAdmin = user && user.role === 'admin';
      
      myAccountBtn.style.display = '';
      // Show email in button text (truncate if too long)
      const email = currentUser.length > 20 ? currentUser.substring(0, 17) + '...' : currentUser;
      
      if (isAdmin) {
        myAccountBtn.innerHTML = `Admin Panel<br><small style="font-size:0.7em; opacity:0.8;">${email}</small>`;
      } else {
        myAccountBtn.innerHTML = `My Account<br><small style="font-size:0.7em; opacity:0.8;">${email}</small>`;
      }
      
      // Update mobile version too
      if (myAccountBtnMobile) {
        myAccountBtnMobile.style.display = '';
        const emailMobile = currentUser.length > 15 ? currentUser.substring(0, 12) + '...' : currentUser;
        
        if (isAdmin) {
          myAccountBtnMobile.innerHTML = `Admin Panel<br><small style="font-size:0.7em; opacity:0.8;">${emailMobile}</small>`;
        } else {
          myAccountBtnMobile.innerHTML = `My Account<br><small style="font-size:0.7em; opacity:0.8;">${emailMobile}</small>`;
        }
      }
    } else {
      myAccountBtn.style.display = 'none';
      if (myAccountBtnMobile) {
        myAccountBtnMobile.style.display = 'none';
      }
    }
  }
  updateMyAccountBtn();
  // Also update on login/logout events if you have custom events
  window.addEventListener('storage', updateMyAccountBtn);

  // Open modal and fill fields (or navigate to admin panel for admins)
  myAccountBtn.addEventListener('click', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const u = users[currentUser];
    if (!u) return;
    
    // Check if user is admin
    const isAdmin = u.role === 'admin';
    
    if (isAdmin) {
      // Navigate to admin panel for admins
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        adminPanel.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    isCheckoutCompletionMode = false;
    
    // Regular user - open My Account modal
    document.getElementById('myAccountUser').value = currentUser;
    document.getElementById('myAccountPass').value = u.password || '';
    document.getElementById('myAccountPassConfirm').value = u.password || '';
    document.getElementById('myAccountLastName').value = u.lastName || '';
    document.getElementById('myAccountFirstName').value = u.firstName || '';
    document.getElementById('myAccountStreet').value = u.street || '';
    document.getElementById('myAccountNumber').value = u.number || '';
    document.getElementById('myAccountApp').value = u.app || '';
    document.getElementById('myAccountPostal').value = u.postal || '';
    document.getElementById('myAccountCity').value = u.city || '';
    document.getElementById('myAccountCountry').value = u.country || '';
    document.getElementById('myAccountError').textContent = '';
    myAccountModal.classList.add('open');
  });

  // Mobile My Account button event listener
  const myAccountBtnMobile = document.getElementById('myAccountBtnMobile');
  if (myAccountBtnMobile) {
    myAccountBtnMobile.addEventListener('click', function() {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return;
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const u = users[currentUser];
      if (!u) return;
      
      const isAdmin = u.role === 'admin';
      
      if (isAdmin) {
        // Navigate to admin panel for admins
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
          adminPanel.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile menu
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
          hamburgerMenu.style.display = 'none';
        }
        return;
      }
      
      // Reset checkout completion mode for normal My Account usage
      isCheckoutCompletionMode = false;
      
      // Regular user - open My Account modal
      document.getElementById('myAccountUser').value = currentUser;
      document.getElementById('myAccountPass').value = u.password || '';
      document.getElementById('myAccountPassConfirm').value = u.password || '';
      document.getElementById('myAccountLastName').value = u.lastName || '';
      document.getElementById('myAccountFirstName').value = u.firstName || '';
      document.getElementById('myAccountStreet').value = u.street || '';
      document.getElementById('myAccountNumber').value = u.number || '';
      document.getElementById('myAccountApp').value = u.app || '';
      document.getElementById('myAccountPostal').value = u.postal || '';
      document.getElementById('myAccountCity').value = u.city || '';
      document.getElementById('myAccountCountry').value = u.country || '';
      document.getElementById('myAccountError').textContent = '';
      myAccountModal.classList.add('open');
      // Close mobile menu
      const hamburgerMenu = document.getElementById('hamburgerMenu');
      if (hamburgerMenu) {
        hamburgerMenu.style.display = 'none';
      }
    });
  }

  closeMyAccountBtn.addEventListener('click', function() {
    isCheckoutCompletionMode = false;  // Reset flag when closing modal
    myAccountModal.classList.remove('open');
    // Refresh admin panel visibility after closing My Account
    setTimeout(() => {
      showLoginStatus();
    }, 100);
  });

  // Save changes
  myAccountForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Reset field styling
    document.querySelectorAll('#myAccountModal input').forEach(input => {
      input.style.border = '';
      input.style.backgroundColor = '';
    });
    
    // All fields required except app
    const pass = document.getElementById('myAccountPass').value.trim();
    const passConfirm = document.getElementById('myAccountPassConfirm').value.trim();
    const lastName = document.getElementById('myAccountLastName').value.trim();
    const firstName = document.getElementById('myAccountFirstName').value.trim();
    const street = document.getElementById('myAccountStreet').value.trim();
    const number = document.getElementById('myAccountNumber').value.trim();
    const app = document.getElementById('myAccountApp').value.trim();
    const postal = document.getElementById('myAccountPostal').value.trim();
    const city = document.getElementById('myAccountCity').value.trim();
    const country = document.getElementById('myAccountCountry').value.trim();
    const myAccountError = document.getElementById('myAccountError');
    
    if (!pass) {
      myAccountError.textContent = 'Wachtwoord is verplicht.';
      return;
    }
    if (pass !== passConfirm) {
      myAccountError.textContent = 'Wachtwoorden komen niet overeen.';
      return;
    }
    
    // Check if this is a checkout completion attempt
    const wasCheckoutCompletion = isCheckoutCompletionMode;
    // Save user data first
    users[currentUser] = {
      ...users[currentUser],
      password: pass,
      lastName,
      firstName,
      street,
      number,
      app,
      postal,
      city,
      country
    };
  // localStorage disabled in portfolio mode
    // Haal de nieuwste user data uit localStorage voor validatie
    const latestUsers = JSON.parse(localStorage.getItem('users') || '{}');
    const latestUser = latestUsers[currentUser] || {};
    const requiredFields = ['firstName', 'lastName', 'street', 'number', 'postal', 'city', 'country'];
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!latestUser[field] || latestUser[field].trim() === '') {
        missingFields.push(field);
      }
    });
    
    if (wasCheckoutCompletion && missingFields.length === 0) {
      // All fields completed, reset flag and show success
      isCheckoutCompletionMode = false;
      myAccountError.innerHTML = '';
      // Vul de form velden opnieuw met de nieuwste user data
      const latestUsers = JSON.parse(localStorage.getItem('users') || '{}');
      const latestUser = latestUsers[currentUser] || {};
      document.getElementById('myAccountLastName').value = latestUser.lastName || '';
      document.getElementById('myAccountFirstName').value = latestUser.firstName || '';
      document.getElementById('myAccountStreet').value = latestUser.street || '';
      document.getElementById('myAccountNumber').value = latestUser.number || '';
      document.getElementById('myAccountApp').value = latestUser.app || '';
      document.getElementById('myAccountPostal').value = latestUser.postal || '';
      document.getElementById('myAccountCity').value = latestUser.city || '';
      document.getElementById('myAccountCountry').value = latestUser.country || '';
      myAccountModal.classList.remove('open');
      // Forceer een reload zodat alles direct werkt
      setTimeout(() => {
        location.reload();
      }, 100);
    } else if (wasCheckoutCompletion && missingFields.length > 0) {
      // Still missing fields - keep checkout completion mode active
      const fieldNames = {
        firstName: 'Voornaam',
        lastName: 'Achternaam',
        street: 'Straat',
        number: 'Huisnummer',
        postal: 'Postcode',
        city: 'Stad',
        country: 'Land'
      };
      
      const missingFieldsText = missingFields.map(field => fieldNames[field]).join(', ');
      myAccountError.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          <strong>⚠️ Nog niet compleet:</strong><br>
          De volgende velden zijn nog steeds vereist:<br>
          <strong>${missingFieldsText}</strong>
        </div>
      `;
      
      // Highlight missing fields
      missingFields.forEach(field => {
        const element = document.getElementById('myAccount' + field.charAt(0).toUpperCase() + field.slice(1));
        if (element) {
          element.style.border = '2px solid #e74c3c';
          element.style.backgroundColor = '#fdf2f2';
        }
      });
    } else {
      // Regular save - reset flag and show success message briefly
      isCheckoutCompletionMode = false;
      
      myAccountError.style.color = '#4caf50';
      myAccountError.textContent = 'Account gegevens succesvol opgeslagen!';
      setTimeout(() => {
        myAccountModal.classList.remove('open');
        myAccountError.style.color = '#e63946';
        myAccountError.textContent = '';
      }, 1500);
    }
    
    // Optionally show a success message
  });

  // Hide modal on outside click
  window.addEventListener('click', function(e) {
    if (e.target === myAccountModal) {
      isCheckoutCompletionMode = false;  // Reset flag when closing modal
      myAccountModal.classList.remove('open');
    }
  });
});
// --- Admin User Management: Add/Edit logic (admin-users.html) ---
if (document.getElementById('adminUserForm')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminUserForm');
    const editIndex = document.getElementById('adminUserEditIndex');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let users = JSON.parse(localStorage.getItem('users') || '{}');
      const username = document.getElementById('adminUserName').value.trim();
      const pass = document.getElementById('adminUserPass').value;
      const lastName = document.getElementById('adminUserLastName').value.trim();
      const firstName = document.getElementById('adminUserFirstName').value.trim();
      const street = document.getElementById('adminUserStreet').value.trim();
      const number = document.getElementById('adminUserNumber').value.trim();
      const app = document.getElementById('adminUserApp').value.trim();
      const postal = document.getElementById('adminUserPostal').value.trim();
      const city = document.getElementById('adminUserCity').value.trim();
      const country = document.getElementById('adminUserCountry').value.trim();
      const role = document.getElementById('adminUserRole').value;
      if (!username || !pass) return alert('Username and password required');
      users[username] = {
        password: pass,
        lastName,
        firstName,
        street,
        number,
        app,
        postal,
        city,
        country,
        role
      };
  // localStorage disabled in portfolio mode
      form.reset();
      editIndex.value = '';
      document.getElementById('adminUserSaveBtn').textContent = 'Add User';
      renderAdminUsersList(document.getElementById('adminUserSearch')?.value || '');
    });
    // Edit logic
    document.getElementById('adminUsersList').addEventListener('click', function(e) {
      if (e.target.classList.contains('admin-user-edit-btn')) {
        const username = e.target.getAttribute('data-edituser');
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        const u = users[username];
        if (!u) return;
        document.getElementById('adminUserName').value = username;
        document.getElementById('adminUserPass').value = u.password || '';
        document.getElementById('adminUserLastName').value = u.lastName || '';
        document.getElementById('adminUserFirstName').value = u.firstName || '';
        document.getElementById('adminUserStreet').value = u.street || '';
        document.getElementById('adminUserNumber').value = u.number || '';
        document.getElementById('adminUserApp').value = u.app || '';
        document.getElementById('adminUserPostal').value = u.postal || '';
        document.getElementById('adminUserCity').value = u.city || '';
        document.getElementById('adminUserCountry').value = u.country || '';
        document.getElementById('adminUserRole').value = u.role || 'user';
        editIndex.value = username;
        document.getElementById('adminUserSaveBtn').textContent = 'Update User';
      }
    });
    // Cancel logic
    document.getElementById('adminUserCancelBtn').addEventListener('click', function() {
      form.reset();
      editIndex.value = '';
      document.getElementById('adminUserSaveBtn').textContent = 'Add User';
    });
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
  // localStorage disabled in portfolio mode
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
  
  // Open Clear Storage Tools page from admin panel
  var openClearStorageBtn = document.getElementById('openClearStorageBtn');
  if (openClearStorageBtn) {
    openClearStorageBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.open('clearstorage-buttons.html', '_blank');
    });
  }

  // Keep admin panel visible when returning to main tab
  window.addEventListener('focus', function() {
    showLoginStatus(); // Refresh admin panel visibility
  });

  // Ensure admin panel is visible on page load for admin users
  window.addEventListener('load', function() {
    setTimeout(() => {
      showLoginStatus(); // Refresh admin panel visibility after page fully loads
      
      // Check if user is returning from admin-users page
      if (localStorage.getItem('returnToAdmin') === 'true') {
        localStorage.removeItem('returnToAdmin'); // Clear the flag
        
        // Ensure admin panel is visible and scroll to it
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
          adminPanel.style.display = 'block';
          adminPanel.style.visibility = 'visible';
          setTimeout(() => {
            adminPanel.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    }, 500);
  });
});
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
// Dummy specials data (portfolio mode)
let specials = [
  {
    title: 'Limited Edition LP',
    price: 29.99,
    desc: 'Special colored vinyl',
    sale: true,
    salePrice: 19.99,
    img: 'assets/Logo-DV1.png'
  },
  {
    title: 'Classic Maxi',
    price: 14.99,
    desc: 'Original 80s pressing',
    sale: false,
    salePrice: null,
    img: 'assets/KH-dance4.jpg'
  }
];
const adminSpecialsList = document.getElementById('adminSpecialsList');
const adminSpecialForm = document.getElementById('adminSpecialForm');

function saveSpecials() {
  // localStorage disabled in portfolio mode
  // specials are not saved
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

// Form submit logic
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

// Render specials list on load
document.addEventListener('DOMContentLoaded', function() {
  renderAdminSpecialsList();
  renderSpecialsGrid();
});
// --- Admin: platenbeheer met foto upload ---
// Dummy records data (portfolio mode)
let records = [
  {
    artist: 'The Beatles',
    title: 'Abbey Road',
    catalogNr: 'PCS 7088',
    qt: 5,
    price: 24.99,
    salePrice: 19.99,
  img: 'assets/KH-dance4.jpg' // image 1 (Abbey Road)
  },
  {
    artist: 'Daft Punk',
    title: 'Discovery',
    catalogNr: '7243 8496062 1',
    qt: 2,
    price: 29.99,
    salePrice: null,
  img: 'assets/slipmat-1.jpg' // image 2 (Technics slipmat)
  }
];
const adminRecordForm = document.getElementById('adminRecordForm');
const adminRecordsList = document.getElementById('adminRecordsList');
const recordsGrid = document.getElementById('recordsGrid');

function saveRecords() {
  // localStorage disabled in portfolio mode
  // records are not saved
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

// --- Paginering voor records ---
let recordsPage = 1;
function getRecordsPerPage() {
  if (window.innerWidth <= 700) return 4;
  return 20; // 5 kolommen x 4 rijen
}
function renderRecordsGrid() {
  if (!recordsGrid) return;
  const all = records.filter(r => r.qt > 0);
  const perPage = getRecordsPerPage();
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  if (recordsPage > totalPages) recordsPage = totalPages;
  if (recordsPage < 1) recordsPage = 1;
  const start = (recordsPage - 1) * perPage;
  const pageRecords = all.slice(start, start + perPage);
  recordsGrid.innerHTML = '';
  if (all.length === 0) {
    recordsGrid.innerHTML = '<div class="empty-grid-message">Geen records gevonden</div>';
  } else {
        pageRecords.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'record-card';
      div.innerHTML = `
        <img src="${rec.img || 'assets/Logo-DV1.png'}" alt="${rec.artist} - ${rec.title}">
        <div class="record-card-info">
          <div class="record-title">${rec.title}</div>
          <div class="record-artist">${rec.artist}</div>
          <div class="record-price">
            ${rec.salePrice ? `<img src='assets/iconssales.png' alt='Sale' class='card-sale-icon ani ani6'> €${rec.salePrice.toFixed(2)} <span class='sale-old-price'>€${rec.price.toFixed(2)}</span>` : `€${rec.price.toFixed(2)}`}
          </div>
          ${rec.ytLink ? `<div class='yt-link-row'><a href="${rec.ytLink}" target="_blank" class="yt-link"><img src="assets/youtube.png" alt="YouTube"></a></div>` : ''}
        </div>
      `;
      
      // Info popup on click
      div.onclick = function() {
        showItemInfoPopup(rec);
      };
      // Add button separately to avoid quote issues
      const addButton = document.createElement('button');
      addButton.className = 'record-add';
      addButton.textContent = 'Add to cart';
      addButton.setAttribute('data-i18n', 'add_to_cart');
      addButton.onclick = function(e) {
        e.stopPropagation();
        addToCart(`${rec.artist} - ${rec.title}`, rec.salePrice ? rec.salePrice : rec.price, rec.img || '', 'record');
      };
      div.querySelector('.record-card-info').appendChild(addButton);
      recordsGrid.appendChild(div);
    });
  }
  // Pagina info
  const pageInfo = document.getElementById('recordsPageInfo');
  if (pageInfo) pageInfo.textContent = `Page ${recordsPage} / ${totalPages}`;
  // Knoppen
  const prevBtn = document.getElementById('recordsPrevBtn');
  const nextBtn = document.getElementById('recordsNextBtn');
  if (prevBtn) prevBtn.disabled = recordsPage <= 1;
  if (nextBtn) nextBtn.disabled = recordsPage >= totalPages;
}

document.addEventListener('DOMContentLoaded', function() {
  const prevBtn = document.getElementById('recordsPrevBtn');
  const nextBtn = document.getElementById('recordsNextBtn');
  if (prevBtn) prevBtn.onclick = function() {
    recordsPage--;
    renderRecordsGrid();
  };
  if (nextBtn) nextBtn.onclick = function() {
    recordsPage++;
    renderRecordsGrid();
  };
  window.addEventListener('resize', () => {
    renderRecordsGrid();
  });
});

if (adminRecordForm) {
  adminRecordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const idx = document.getElementById('adminEditIndex').value;
    const artist = document.getElementById('adminArtist').value.trim();
    const title = document.getElementById('adminTitle').value.trim();
    const catalogNr = document.getElementById('adminCatalogNr').value.trim();
    const label = document.getElementById('adminLabel').value.trim();
    const country = document.getElementById('adminCountry').value.trim();
    const category = document.getElementById('adminCategory').value.trim();
    const released = document.getElementById('adminReleased').value.trim();
    const format = document.getElementById('adminFormat').value.trim();
    const trackList = document.getElementById('adminTrackList').value.trim();
    const price = parseFloat(document.getElementById('adminPrice').value);
    const qt = parseInt(document.getElementById('adminQt').value);
    const ytLink = document.getElementById('adminYtLink').value.trim();
    const photoInput = document.getElementById('adminPhoto');
    const handleRecord = (imgData) => {
      const rec = { artist, title, catalogNr, label, country, category, released, format, trackList, price, salePrice: null, qt, ytLink, img: imgData };
      if (idx) {
        records[parseInt(idx)] = rec;
      } else {
        records.push(rec);
      }
      saveRecords();
      renderAdminRecordsList();
      renderRecordsGrid();
      adminRecordForm.reset();
      document.getElementById('adminEditIndex').value = '';
      document.getElementById('adminSaveBtn').textContent = 'Add Record';
      document.getElementById('adminCancelBtn').style.display = 'none';
    };
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        handleRecord(ev.target.result);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      handleRecord(idx ? records[parseInt(idx)].img : '');
    }
  });

  adminRecordsList.addEventListener('click', function(e) {
    if (e.target.dataset.edit) {
      const rec = records[parseInt(e.target.dataset.edit)];
      document.getElementById('adminEditIndex').value = e.target.dataset.edit;
      document.getElementById('adminArtist').value = rec.artist;
      document.getElementById('adminTitle').value = rec.title;
      document.getElementById('adminCatalogNr').value = rec.catalogNr;
      document.getElementById('adminLabel').value = rec.label;
      document.getElementById('adminCountry').value = rec.country;
      document.getElementById('adminCategory').value = rec.category;
      document.getElementById('adminReleased').value = rec.released;
      document.getElementById('adminFormat').value = rec.format;
      document.getElementById('adminTrackList').value = rec.trackList;
      document.getElementById('adminPrice').value = rec.price;
      // Sale price is now managed in the list, not the form
      document.getElementById('adminQt').value = rec.qt;
      document.getElementById('adminYtLink').value = rec.ytLink;
      document.getElementById('adminSaveBtn').textContent = 'Update Record';
      document.getElementById('adminCancelBtn').style.display = '';
    } else if (e.target.dataset.del) {
      if (confirm('Delete this record?')) {
        records.splice(parseInt(e.target.dataset.del), 1);
        saveRecords();
        renderAdminRecordsList();
        renderRecordsGrid();
      }
    }
  });

  document.getElementById('adminCancelBtn').addEventListener('click', function() {
    adminRecordForm.reset();
    document.getElementById('adminEditIndex').value = '';
    document.getElementById('adminSaveBtn').textContent = 'Add Record';
    this.style.display = 'none';
  });

  document.getElementById('adminSearch').addEventListener('input', function() {
    renderAdminRecordsList(this.value);
  });
}

// Init records grid bij laden
document.addEventListener('DOMContentLoaded', function() {
  renderAdminRecordsList();
  renderRecordsGrid();
});
// --- Winkelmandje functionaliteit ---
let cart = [];
const cartCountEl = document.getElementById('cartCount');
const mobileCartCountEl = document.getElementById('mobileCartCount');
const cartModal = document.getElementById('cartModal');
const cartItemsEl = document.getElementById('cartItems');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const cartTotalPrice = document.getElementById('cartTotalPrice');

function updateCartCount() {
  // Sommeer alle items (zelfde plaat kan vaker voorkomen)
  let count = 0;
  userCart.forEach(item => {
    count += item.qty ? item.qty : 1;
  });
  cartCountEl.textContent = count;
  mobileCartCountEl.textContent = count;
  var cartCountNavEl = document.getElementById('cartCountNav');
  if (cartCountNavEl) cartCountNavEl.textContent = count;
}

function calculateCartTotal() {
  let total = 0;
  userCart.forEach(item => {
    total += item.price * (item.qty || 1);
  });
  return total;
}

function updateCartTotal() {
  const total = calculateCartTotal();
  if (cartTotalPrice) {
    cartTotalPrice.textContent = `€${total.toFixed(2)}`;
  }
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  
  if (userCart.length === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty">Je winkelmandje is leeg.</div>';
    updateCartTotal();
    return;
  }
  
  userCart.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    // Split title for records to show artist and title separately
    let displayTitle = item.title;
    let displayArtist = '';
    if (item.type !== 'special' && item.title.includes(' - ')) {
      const parts = item.title.split(' - ');
      displayArtist = parts[0];
      displayTitle = parts[1] || parts[0];
    }
    
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}" onerror="this.src='assets/placeholder.png'">
      <div class="cart-item-info">
        <div class="cart-item-title">${displayTitle}${item.type === 'special' ? ' <span class="cart-special-badge">(Special)</span>' : ''}</div>
        ${displayArtist ? `<div class="cart-item-artist">${displayArtist}</div>` : ''}
        <div class="cart-item-price">€${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-quantity-btn decrease-btn" data-idx="${idx}" ${(item.qty || 1) <= 1 ? 'disabled' : ''}>-</button>
        <span class="cart-quantity">${item.qty || 1}</span>
        <button class="cart-quantity-btn increase-btn" data-idx="${idx}">+</button>
        <button class="cart-item-remove remove-btn" data-idx="${idx}" title="Remove item">&times;</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  
  // Add event listeners for cart controls
  const decreaseBtns = cartItemsEl.querySelectorAll('.decrease-btn');
  const increaseBtns = cartItemsEl.querySelectorAll('.increase-btn');
  const removeBtns = cartItemsEl.querySelectorAll('.remove-btn');
  
  decreaseBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      decreaseQuantity(idx);
    });
  });
  
  increaseBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      increaseQuantity(idx);
    });
  });
  
  removeBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      removeFromCart(idx);
    });
  });
  
  updateCartTotal();
}

window.addToCart = function(title, price, img, type) {
  const savedUser = localStorage.getItem('currentUser');
  
  // Allow guest cart functionality
  if (!savedUser || !currentUser) {
    // Use guest cart
    if (!userCart) userCart = [];
  }
  
  type = type || 'record';
  // Uniek maken op basis van title, price, img, type
  const found = userCart.find(item => item.title === title && item.price === price && item.img === img && item.type === type);
  if (found) {
    found.qty = (found.qty || 1) + 1;
  } else {
    userCart.push({ title, price, img, qty: 1, type });
  }
  saveUserCart();
  updateCartCount();
  renderCart();
  // openCart(); // Cart does not open automatically anymore
};

window.removeFromCart = function(idx) {
  userCart.splice(idx, 1);
  saveUserCart();
  updateCartCount();
  renderCart();
};

window.increaseQuantity = function(idx) {
  if (userCart[idx]) {
    userCart[idx].qty = (userCart[idx].qty || 1) + 1;
    saveUserCart();
    updateCartCount();
    renderCart();
  }
};

window.decreaseQuantity = function(idx) {
  if (userCart[idx] && (userCart[idx].qty || 1) > 1) {
    userCart[idx].qty -= 1;
    saveUserCart();
    updateCartCount();
    renderCart();
  }
};

window.clearCart = function() {
  if (confirm('Weet je zeker dat je alle items uit je winkelmandje wilt verwijderen?')) {
    userCart.length = 0;
    saveUserCart();
    updateCartCount();
    renderCart();
  }
};

function openCart() {
  cartModal.classList.add('open');
  renderCart();
}

function closeCart() {
  cartModal.classList.remove('open');
}

// Cart event listeners
if (closeCartBtn) closeCartBtn.onclick = closeCart;
if (clearCartBtn) clearCartBtn.onclick = clearCart;

// Open cart when clicking cart icon
const cartBtns = [
  document.getElementById('cartBtn'),
  document.getElementById('cartBtnNav'),
  document.getElementById('mobileCartBtn')
];

cartBtns.forEach(btn => {
  if (btn) {
    btn.onclick = openCart;
  }
});

// Close cart modal on outside click
if (cartModal) {
  cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) closeCart();
  });
}

// --- Hamburger menu ---
const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');

function closeMenu() {
  hamburgerMenu.classList.remove('open');
}
window.closeMenu = closeMenu;

if (hamburgerBtn) {
  hamburgerBtn.onclick = (e) => {
    e.stopPropagation();
    hamburgerMenu.classList.toggle('open');
  };
}

// Sluit hamburger menu bij klik buiten menu of op een link
document.addEventListener('click', function(e) {
  if (
    hamburgerMenu.classList.contains('open') &&
    !hamburgerMenu.contains(e.target) &&
    e.target !== hamburgerBtn &&
    !hamburgerBtn.contains(e.target)
  ) {
    hamburgerMenu.classList.remove('open');
  }
});

// Sluit hamburger menu bij navigatie (optioneel, extra safety)
const hamburgerLinks = hamburgerMenu.querySelectorAll('a, button');
hamburgerLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburgerMenu.classList.remove('open');
  });
});

// --- Cart modal open/close ---
const cartBtn = document.getElementById('cartBtn');
const cartBtnNav = document.getElementById('cartBtnNav');
const mobileCartBtn = document.getElementById('mobileCartBtn');
cartBtn.onclick = () => cartModal.classList.toggle('open');
cartBtnNav.onclick = () => cartModal.classList.toggle('open');
mobileCartBtn.onclick = () => cartModal.classList.toggle('open');

// Sluit cart bij klik buiten modal
document.addEventListener('click', function(e) {
  if (
    cartModal.classList.contains('open') &&
    !cartModal.contains(e.target) &&
    !cartBtn.contains(e.target) &&
    !(cartBtnNav && cartBtnNav.contains(e.target)) &&
    !mobileCartBtn.contains(e.target)
  ) {
    cartModal.classList.remove('open');
  }
});

// --- Sales Slideout ---
function renderSalesRecords() {
  const salesList = document.getElementById('salesRecordsList');
  if (!salesList) return;
  salesList.innerHTML = '';
  const sales = records.filter(r => r.salePrice && r.qt > 0);
  const specialsSales = specials.filter(sp => sp.sale);
  if (sales.length === 0 && specialsSales.length === 0) {
    salesList.innerHTML = '<div class="empty-sales-message">No sales records</div>';
    return;
  }
  // Records met salePrice
  sales.forEach(r => {
    const div = document.createElement('div');
    div.className = 'record-card';
    div.innerHTML = `
      <img src="${r.img || 'assets/Logo-DV1.png'}" alt="${r.artist} - ${r.title}">
      <div class="record-card-info">
        <div class="record-title">${r.title}</div>
        <div class="record-artist">${r.artist}</div>
        <div class="record-price">
          <img src='assets/iconssales.png' alt='Sale' class='card-sale-icon ani ani6'> €${r.salePrice.toFixed(2)} <span class='sale-old-price'>€${r.price.toFixed(2)}</span>
        </div>
      </div>
    `;
    div.onclick = function() {
      showItemInfoPopup(r);
    };
    const addButton = document.createElement('button');
    addButton.className = 'record-add';
    addButton.textContent = 'Add to cart';
    addButton.setAttribute('data-i18n', 'add_to_cart');
    addButton.onclick = function(e) {
      e.stopPropagation();
      addToCart(`${r.artist} - ${r.title}`, r.salePrice, r.img || '', 'record');
    };
    div.querySelector('.record-card-info').appendChild(addButton);
    salesList.appendChild(div);
  });
  // Specials met sale=true
  specialsSales.forEach(sp => {
    const div = document.createElement('div');
    div.className = 'record-card';
    div.innerHTML = `
      <img src="${sp.img || 'assets/Logo-DV1.png'}" alt="${sp.title}">
      <div class="record-card-info">
        <div class="record-title">${sp.title}</div>
        <div class="record-artist">${sp.desc || ''}</div>
        <div class="record-price">
          <img src='assets/iconssales.png' alt='Sale' class='card-sale-icon ani ani6'> €${parseFloat(sp.salePrice).toFixed(2)} <span class='sale-old-price'>€${parseFloat(sp.price).toFixed(2)}</span>
        </div>
      </div>
    `;
    // Info popup on click for specials
    div.onclick = function(e) {
      // Prevent opening when clicking the add-to-cart button
      if (e.target.classList.contains('record-add')) return;
      showItemInfoPopup({
        img: sp.img,
        title: sp.title,
        artist: sp.desc || '',
        price: sp.price,
        salePrice: sp.salePrice,
        desc: sp.desc
      });
    };
    const addButton = document.createElement('button');
    addButton.className = 'record-add';
    addButton.textContent = 'Add to cart';
    addButton.setAttribute('data-i18n', 'add_to_cart');
    addButton.onclick = function(e) {
      e.stopPropagation();
      addToCart(sp.title, parseFloat(sp.salePrice), sp.img || '', 'special');
    };
    div.querySelector('.record-card-info').appendChild(addButton);
    salesList.appendChild(div);
  });
}
  // Sales slideout: render sales records when opened
  // Sales slideout: render sales records when opened
  const openBtn = document.getElementById('openSalesBtn');
  if (openBtn) openBtn.addEventListener('click', renderSalesRecords);
  // Mobile
  const openBtnMobile = document.getElementById('openSalesBtnMobile');
  if (openBtnMobile) openBtnMobile.addEventListener('click', renderSalesRecords);
const salesSlideout = document.getElementById('salesSlideout');
const openSalesBtn = document.getElementById('openSalesBtn');
const openSalesBtnMobile = document.getElementById('openSalesBtnMobile');
const closeSalesBtn = document.getElementById('closeSalesBtn');

function openSales() {
  salesSlideout.classList.add('open');
}
function closeSales() {
  salesSlideout.classList.remove('open');
}

if (openSalesBtn) openSalesBtn.onclick = openSales;
if (openSalesBtnMobile) openSalesBtnMobile.onclick = function() {
  closeMenu();
  openSales();
};
if (closeSalesBtn) closeSalesBtn.onclick = closeSales;

// Sluit sales slideout bij klik buiten (ook op mobile)
document.addEventListener('click', function(e) {
  if (
    salesSlideout.classList.contains('open') &&
    !salesSlideout.contains(e.target) &&
    e.target !== openSalesBtn &&
    e.target !== openSalesBtnMobile
  ) {
    closeSales();
  }
});

// --- Gebruikersbeheer (dummy localStorage) ---
let users = JSON.parse(localStorage.getItem('users') || '{}');
if (!users['admin@doctorvinyl.be']) {
  users['admin@doctorvinyl.be'] = { password: '123', role: 'admin', address: '' };
  // Also keep the old admin for backwards compatibility
  users['admin'] = { password: '123', role: 'admin', address: '' };
  // localStorage disabled in portfolio mode
}
let currentUser = null; // {username, address}
let userCart = [];

function saveUsers() {
  // localStorage disabled in portfolio mode
}

function setCurrentUser(username) {
  currentUser = { username, address: users[username].address || '' };
  // localStorage disabled in portfolio mode
  
  // Try to load cart from localStorage first, then sessionStorage
  let cartData = localStorage.getItem('cart_' + username);
  if (!cartData) {
    cartData = sessionStorage.getItem('cart_' + username);
  }
  userCart = JSON.parse(cartData || '[]');
}

function saveUserCart() {
  if (currentUser) {
    try {
  // localStorage disabled in portfolio mode
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Clearing all localStorage...');
        
        // Show clear storage button
        const clearBtn = document.getElementById('clearStorageBtn');
        if (clearBtn) clearBtn.style.display = '';
        
        // Clear everything and start fresh
        localStorage.clear();
        
        // Recreate essential data
        const users = {
          'admin@doctorvinyl.be': { password: '123', role: 'admin', address: '' },
          'admin': { password: '123', role: 'admin', address: '' }
        };
  // localStorage disabled in portfolio mode
  // localStorage disabled in portfolio mode
        
        // Try to save cart again
        try {
          // localStorage disabled in portfolio mode
        } catch (e2) {
          console.error('Still unable to save cart data, using sessionStorage');
          // Use sessionStorage as fallback
          sessionStorage.setItem('cart_' + currentUser.username, JSON.stringify(userCart));
        }
      } else {
        console.error('Error saving cart:', e);
      }
    }
  } else {
    // Save guest cart
    try {
  // localStorage disabled in portfolio mode
    } catch (e) {
      console.error('Error saving guest cart:', e);
      sessionStorage.setItem('cart_guest', JSON.stringify(userCart));
    }
  }
}

function clearUserCart() {
  if (currentUser) {
    userCart = [];
    saveUserCart();
  }
}

// --- UI Elements ---
const loginBtn = document.getElementById('loginBtn');
const loginBtnMobile = document.getElementById('loginBtnMobile');
const registerBtn = document.getElementById('registerBtn');
const registerBtnMobile = document.getElementById('registerBtnMobile');
const loginStatus = document.getElementById('loginStatus');
const loginStatusMobile = document.getElementById('loginStatusMobile');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const addressModal = document.getElementById('addressModal');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const closeRegisterBtn = document.getElementById('closeRegisterBtn');
const closeAddressBtn = document.getElementById('closeAddressBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const addressForm = document.getElementById('addressForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const addressError = document.getElementById('addressError');

// --- Login/Register Modal Logic ---
function showLoginStatus() {
  if (currentUser) {
    // Hide login status text since email is now shown in My Account button
    loginStatus.textContent = '';
    loginStatusMobile.textContent = '';
    loginBtn.textContent = 'Logout';
    loginBtnMobile.textContent = 'Logout';
    registerBtn.style.display = 'none';
    registerBtnMobile.style.display = 'none';
    
    // Update My Account button with email
    const myAccountBtn = document.getElementById('myAccountBtn');
    const myAccountBtnMobile = document.getElementById('myAccountBtnMobile');
    
    // Check if user is admin
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userObj = users[currentUser.username];
    const isAdmin = userObj && userObj.role === 'admin';
    
    if (myAccountBtn) {
      myAccountBtn.style.display = '';
      const email = currentUser.username.length > 20 ? currentUser.username.substring(0, 17) + '...' : currentUser.username;
      
      if (isAdmin) {
        myAccountBtn.innerHTML = `Admin Panel<br><small style="font-size:0.7em; opacity:0.8;">${email}</small>`;
      } else {
        myAccountBtn.innerHTML = `My Account<br><small style="font-size:0.7em; opacity:0.8;">${email}</small>`;
      }
    }
    if (myAccountBtnMobile) {
      myAccountBtnMobile.style.display = '';
      const emailMobile = currentUser.username.length > 15 ? currentUser.username.substring(0, 12) + '...' : currentUser.username;
      
      if (isAdmin) {
        myAccountBtnMobile.innerHTML = `Admin Panel<br><small style="font-size:0.7em; opacity:0.8;">${emailMobile}</small>`;
      } else {
        myAccountBtnMobile.innerHTML = `My Account<br><small style="font-size:0.7em; opacity:0.8;">${emailMobile}</small>`;
      }
    }
    
    // Admin panel always visible for admins
    var adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
      if (isAdmin) {
        adminPanel.style.display = 'block'; // Force display for admins
        adminPanel.style.visibility = 'visible';
        // Don't auto-scroll unless specifically logging in
        if (window.justLoggedIn) {
          setTimeout(() => {
            adminPanel.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          window.justLoggedIn = false;
        }
      } else {
        adminPanel.style.display = 'none';
      }
    }
    
    // Show clear storage button for admins when needed
    const clearStorageBtn = document.getElementById('openClearStorageBtn');
    if (clearStorageBtn && isAdmin) {
      clearStorageBtn.style.display = 'inline-block';
      clearStorageBtn.style.visibility = 'visible';
    } else if (clearStorageBtn) {
      clearStorageBtn.style.display = 'none';
    }
    
  } else {
    loginStatus.textContent = '';
    loginStatusMobile.textContent = '';
    loginBtn.textContent = 'Login';
    loginBtnMobile.textContent = 'Login';
    registerBtn.style.display = '';
    registerBtnMobile.style.display = '';
    
    // Hide My Account button when not logged in
    const myAccountBtn = document.getElementById('myAccountBtn');
    const myAccountBtnMobile = document.getElementById('myAccountBtnMobile');
    if (myAccountBtn) {
      myAccountBtn.style.display = 'none';
    }
    if (myAccountBtnMobile) {
      myAccountBtnMobile.style.display = 'none';
    }
    
    var adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
    
    // Hide clear storage button for non-admins
    const clearStorageBtn = document.getElementById('openClearStorageBtn');
    if (clearStorageBtn) clearStorageBtn.style.display = 'none';
  }
}

function openLogin() {
  loginModal.classList.add('open');
  loginError.style.display = 'none';
  loginForm.reset();
}
function closeLogin() {
  loginModal.classList.remove('open');
}
function openRegister() {
  registerModal.classList.add('open');
  registerError.style.display = 'none';
  registerForm.reset();
}
function closeRegister() {
  registerModal.classList.remove('open');
}
function openAddress() {
  addressModal.classList.add('open');
  addressError.style.display = 'none';
  addressForm.reset();
}
function closeAddress() {
  addressModal.classList.remove('open');
}

if (loginBtn) loginBtn.onclick = function() {
  if (currentUser) {
    doLogout();
  } else {
    openLogin();
  }
};
if (loginBtnMobile) loginBtnMobile.onclick = function() {
  closeMenu();
  if (currentUser) {
    doLogout();
  } else {
    openLogin();
  }
};
if (registerBtn) registerBtn.onclick = openRegister;
if (registerBtnMobile) registerBtnMobile.onclick = function() {
  closeMenu();
  openRegister();
};
if (closeLoginBtn) closeLoginBtn.onclick = closeLogin;
if (closeRegisterBtn) closeRegisterBtn.onclick = closeRegister;
if (closeAddressBtn) closeAddressBtn.onclick = closeAddress;

// Sluit modals bij klik buiten
[loginModal, registerModal, addressModal].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
});

// --- Registratie ---
registerForm && registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const user = document.getElementById('registerUser').value.trim();
  const pass = document.getElementById('registerPass').value;
  const passConfirm = document.getElementById('registerPassConfirm').value;
  const lastName = document.getElementById('registerLastName').value.trim();
  const firstName = document.getElementById('registerFirstName').value.trim();
  const street = document.getElementById('registerStreet').value.trim();
  const number = document.getElementById('registerNumber').value.trim();
  const app = document.getElementById('registerApp').value.trim();
  const postal = document.getElementById('registerPostal').value.trim();
  const city = document.getElementById('registerCity').value.trim();
  const country = document.getElementById('registerCountry').value.trim();
  
  if (!user || !pass) {
    registerError.textContent = 'Email en wachtwoord zijn verplicht.';
    registerError.style.display = 'block';
    return;
  }
  if (pass !== passConfirm) {
    registerError.textContent = 'Wachtwoorden komen niet overeen.';
    registerError.style.display = 'block';
    return;
  }
  if (users[user]) {
    registerError.textContent = 'Email bestaat al.';
    registerError.style.display = 'block';
    return;
  }
  users[user] = { 
    password: pass, 
    lastName,
    firstName,
    street,
    number,
    app,
    postal,
    city,
    country,
    role: 'user'
  };
  saveUsers();
  closeRegister();
  alert('Registratie gelukt! Je kan nu inloggen.');
});

// Real-time password confirmation validation for Register form
const registerPass = document.getElementById('registerPass');
const registerPassConfirm = document.getElementById('registerPassConfirm');

function validateRegisterPasswords() {
   if (registerPass && registerPassConfirm && registerError) {
    if (registerPassConfirm.value && registerPass.value !== registerPassConfirm.value) {
      registerError.textContent = 'Wachtwoorden komen niet overeen.';
      registerError.style.display = 'block';
    } else if (registerPassConfirm.value && registerPass.value === registerPassConfirm.value) {
      registerError.style.display = 'none';
    }
  }
}

if (registerPass && registerPassConfirm) {
  registerPass.addEventListener('input', validateRegisterPasswords);
  registerPassConfirm.addEventListener('input', validateRegisterPasswords);
}

// --- Login ---
loginForm && loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (users[user] && users[user].password === pass) {
    setCurrentUser(user);
    closeLogin();
    window.justLoggedIn = true; // Flag to trigger scroll
    showLoginStatus();
    updateCartCount();
    renderCart();
    resetLogoutTimer();
    // If admin, scroll to admin panel
    if (users[user].role === 'admin') {
      var adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        adminPanel.style.display = '';
        setTimeout(() => {
          adminPanel.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Force reload so admin panel button appears instantly
      location.reload();
      location.hash = '#adminPanel';
    }
  } else {
    loginError.textContent = 'Ongeldige gebruikersnaam of wachtwoord.';
    loginError.style.display = 'block';
  }
});

// --- Logout ---
function doLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  userCart = [];
  showLoginStatus();
  updateCartCount();
  renderCart();
  updateAdminPanelAccess(); // Verberg admin knop direct
  if (logoutTimer) clearTimeout(logoutTimer);
  alert('Je bent uitgelogd.');
}

// --- Checkout met shipping berekening ---
checkoutBtn.onclick = function() {
  if (userCart.length === 0) {
    alert('Je winkelmandje is leeg.');
    return;
  }
  
  if (!currentUser) {
    // Ask guest user to login or register before checkout
    if (confirm('Je moet ingelogd zijn om af te rekenen. Wil je nu inloggen?')) {
      openLogin();
      const loginError = document.getElementById('loginError');
      if (loginError) {
        loginError.textContent = 'Log in om door te gaan met afrekenen.';
        loginError.style.display = 'block';
      }
    }
    return;
  }
  
  const user = users[currentUser.username];
  
  // Validate required fields for checkout
  const requiredFields = ['firstName', 'lastName', 'street', 'number', 'postal', 'city', 'country'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!user[field] || user[field].trim() === '') {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    const fieldNames = {
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      street: 'Straat',
      number: 'Huisnummer',
      postal: 'Postcode',
      city: 'Stad',
      country: 'Land'
    };
    
    const missingFieldsText = missingFields.map(field => fieldNames[field]).join(', ');
    
    if (confirm(`Je account is nog niet volledig ingevuld voor verzending.\n\nOntbrekende gegevens: ${missingFieldsText}\n\nWil je je gegevens nu aanvullen?`)) {
      // Close cart popup so only account modal is open
      if (cartModal) cartModal.classList.remove('open');
      // Open My Account modal to complete profile
      openMyAccountForCompletion(missingFields);
    }
    return;
  }
  
  // Calculate shipping
  const destination = getShippingDestination(user);
  const shippingData = calculateShipping(userCart, destination);
  
  // Show order preview with shipping
  showOrderPreview(userCart, user, shippingData);
};

function openMyAccountForCompletion(missingFields) {
  const user = users[currentUser.username];
  
  // Fill current data
  document.getElementById('myAccountUser').value = currentUser.username;
  document.getElementById('myAccountPass').value = user.password || '';
  document.getElementById('myAccountPassConfirm').value = user.password || '';
  document.getElementById('myAccountLastName').value = user.lastName || '';
  document.getElementById('myAccountFirstName').value = user.firstName || '';
  document.getElementById('myAccountStreet').value = user.street || '';
  document.getElementById('myAccountNumber').value = user.number || '';
  document.getElementById('myAccountApp').value = user.app || '';
  document.getElementById('myAccountPostal').value = user.postal || '';
  document.getElementById('myAccountCity').value = user.city || '';
  document.getElementById('myAccountCountry').value = user.country || '';
  
  // Show error message with missing fields
  const fieldNames = {
    firstName: 'Voornaam',
    lastName: 'Achternaam', 
    street: 'Straat',
    number: 'Huisnummer',
    postal: 'Postcode',
    city: 'Stad',
    country: 'Land'
  };
  
  const missingFieldsText = missingFields.map(field => fieldNames[field]).join(', ');
  
  // Set checkout completion mode flag
  isCheckoutCompletionMode = true;
  
  document.getElementById('myAccountError').innerHTML = `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
      <strong>⚠️ Aanvullen vereist:</strong><br>
      Vul de volgende velden in om je bestelling te kunnen plaatsen:<br>
      <strong>${missingFieldsText}</strong>
    </div>
  `;
  
  // Highlight missing fields
  missingFields.forEach(field => {
    const element = document.getElementById('myAccount' + field.charAt(0).toUpperCase() + field.slice(1));
    if (element) {
      element.style.border = '2px solid #e74c3c';
      element.style.backgroundColor = '#fdf2f2';
    }
  });
  
  const myAccountModal = document.getElementById('myAccountModal');
  myAccountModal.classList.add('open');
}

function showOrderPreview(cartItems, user, shippingData) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingData.cost;
  
  const freeShippingText = shippingData.isFree ? 
    '<div class="free-shipping">🎉 Gratis verzending!</div>' : 
    (shippingData.cost > 0 && subtotal < shippingData.rate.free ? 
      `<div class="shipping-info">💡 Nog €${(shippingData.rate.free - subtotal).toFixed(2)} voor gratis verzending!</div>` : '');
  
  const preview = `
    <div class="order-preview">
      <h3>🛒 Bestelling overzicht</h3>
      <div class="order-items">
        ${cartItems.map(item => `
          <div class="order-item">
            <div class="order-item-info">
              <strong>${item.artist}</strong> - ${item.title}
              <br><small>${item.format} • €${item.price.toFixed(2)} × ${item.quantity}</small>
            </div>
            <div class="order-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="order-shipping">
        <h4>📦 Verzending naar ${shippingData.rate.name}</h4>
        <div class="shipping-address">
          <strong>${user.firstName || ''} ${user.lastName || ''}</strong><br>
          ${user.street || ''} ${user.number || ''} ${user.app || ''}<br>
          ${user.postal || ''} ${user.city || ''}<br>
          ${user.country || ''}
        </div>
        ${freeShippingText}
      </div>
      
      <div class="order-totals">
        <div class="total-row">
          <span>Subtotaal:</span>
          <span>€${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row ${shippingData.isFree ? 'free-shipping-row' : ''}">
          <span>Verzendkosten:</span>
          <span>${shippingData.isFree ? 'GRATIS' : '€' + shippingData.cost.toFixed(2)}</span>
        </div>
        <div class="total-row total-final">
          <strong>Totaal: €${total.toFixed(2)}</strong>
        </div>
      </div>
      
      <div class="order-actions">
        <button onclick="confirmOrder()" class="record-add order-confirm-btn">✅ Bestelling bevestigen</button>
        <button onclick="editShipping()" class="admin-cancel-btn">✏️ Adres wijzigen</button>
      </div>
    </div>
  `;
  
  document.getElementById('cartItems').innerHTML = preview;
}

function confirmOrder() {
  const user = users[currentUser.username];
  const destination = getShippingDestination(user);
  const shippingData = calculateShipping(userCart, destination);
  
  // Create order
  const order = createOrder(userCart, user, shippingData);
  
  // Clear cart
  clearUserCart();
  updateCartCount();
  renderCart();
  
  // Show success
  const successMessage = `
    <div class="order-success">
      <h3>🎉 Bestelling bevestigd!</h3>
      <div class="order-number">Bestelnummer: <strong>${order.id}</strong></div>
      <div class="order-summary">
        <p>Je bestelling van €${order.totals.total.toFixed(2)} is ontvangen en wordt verwerkt.</p>
        <p>📧 Een bevestiging wordt verstuurd naar: <strong>${user.email || currentUser.username}</strong></p>
        <p>📦 Verzending: ${order.shipping.destination} (€${order.shipping.cost.toFixed(2)})</p>
        ${order.shipping.isFree ? '<p>🎉 <strong>Gratis verzending!</strong></p>' : ''}
      </div>
      <button onclick="closeOrderSuccess()" class="record-add">Sluiten</button>
    </div>
  `;
  
  document.getElementById('cartItems').innerHTML = successMessage;
  resetLogoutTimer();
}

function editShipping() {
  // Close cart modal and open my account for address editing
  cartModal.classList.remove('open');
  
  // Open My Account modal for address editing
  const user = users[currentUser.username];
  document.getElementById('myAccountUser').value = currentUser.username;
  document.getElementById('myAccountPass').value = user.password || '';
  document.getElementById('myAccountPassConfirm').value = user.password || '';
  document.getElementById('myAccountLastName').value = user.lastName || '';
  document.getElementById('myAccountFirstName').value = user.firstName || '';
  document.getElementById('myAccountStreet').value = user.street || '';
  document.getElementById('myAccountNumber').value = user.number || '';
  document.getElementById('myAccountApp').value = user.app || '';
  document.getElementById('myAccountPostal').value = user.postal || '';
  document.getElementById('myAccountCity').value = user.city || '';
  document.getElementById('myAccountCountry').value = user.country || '';
  document.getElementById('myAccountError').textContent = '';
  
  const myAccountModal = document.getElementById('myAccountModal');
  myAccountModal.classList.add('open');
}

function closeOrderSuccess() {
  cartModal.classList.remove('open');
}

// --- Adres opslaan bij afrekenen ---
addressForm && addressForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const address = document.getElementById('addressInput').value.trim();
  if (!address) {
    addressError.textContent = 'Vul een adres in.';
    addressError.style.display = 'block';
    return;
  }
  users[currentUser.username].address = address;
  saveUsers();
  setCurrentUser(currentUser.username);
  closeAddress();
  alert('Adres opgeslagen! Je kan nu afrekenen.');
});

// --- Inactivity timer: reset bij activiteit ---
let logoutTimer = null;
const LOGIN_TIMEOUT = 3 * 60 * 1000; // 3 minuten
function resetLogoutTimer() {
  if (logoutTimer) clearTimeout(logoutTimer);
  if (currentUser) {
    logoutTimer = setTimeout(() => {
      doLogout();
    }, LOGIN_TIMEOUT);
  }
}
['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (currentUser) resetLogoutTimer();
  });
});

// --- Zoekfunctionaliteit (dummy) ---
function handleSearch(query) {
  if (query.trim()) {
    window.location.hash = '#records';
  }
}
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleSearch(this.value);
});
document.getElementById('mobileSearchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    handleSearch(this.value);
    hamburgerMenu.classList.remove('open');
  }
});

// --- Admin panel access ---
document.addEventListener('DOMContentLoaded', function() {
  updateAdminPanelAccess();
});

// Show/hide admin panel button based on user role
function updateAdminPanelAccess() {
  const adminAccessPanel = document.getElementById('adminAccessPanel');
  if (adminAccessPanel) {
    adminAccessPanel.style.display = 'flex';
  }
}

window.addEventListener('storage', updateAdminPanelAccess);

// --- Init ---
document.addEventListener('DOMContentLoaded', function() {
  // Check if localStorage is available and not full
  try {
  // localStorage disabled in portfolio mode
    localStorage.removeItem('test');
  } catch (e) {
    console.warn('LocalStorage issue detected, clearing...');
    localStorage.clear();
    // Recreate admin user
    const users = { 
      'admin@doctorvinyl.be': { password: '123', role: 'admin', address: '' },
      'admin': { password: '123', role: 'admin', address: '' }
    };
  // localStorage disabled in portfolio mode
  }

  // Clear Storage Button (emergency)
  const clearStorageBtn = document.getElementById('clearStorageBtn');
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', function() {
      if (confirm('This will clear all data and log you out. Are you sure?')) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
      }
    });
    // Show button when storage issues occur
    window.addEventListener('storage-error', function() {
      clearStorageBtn.style.display = '';
    });
  }

  // Restore current user from localStorage
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedUser && users[savedUser]) {
    setCurrentUser(savedUser);
  } else {
    // Load guest cart if no user is logged in
    const guestCartData = localStorage.getItem('cart_guest') || sessionStorage.getItem('cart_guest');
    userCart = JSON.parse(guestCartData || '[]');
  }
  
  showLoginStatus();
  updateCartCount();
  renderCart();
  // Taalkeuze
  var langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', function() {
      if (typeof setLang === 'function') setLang(this.value);
    });
    langSelect.value = document.documentElement.lang || 'en';
  }
  // Admin panel standaard verbergen
  var adminPanel = document.getElementById('adminPanel');
  if (adminPanel) adminPanel.style.display = 'none';
});

// Clear Storage Functions
function initClearStoragePage() {
  // Clear Users
  const clearUsersBtn = document.getElementById('clearUsersBtn');
  if (clearUsersBtn) {
    clearUsersBtn.addEventListener('click', function() {
      if (confirm('Weet je zeker dat je alle gebruikers wilt verwijderen?')) {
        localStorage.removeItem('users');
        showClearMessage('Alle gebruikers verwijderd!', '#ff6b6b');
        setTimeout(showStorageStatus, 1000); // Update status after message
      }
    });
  }
  
  // Clear Records
  const clearRecordsBtn = document.getElementById('clearRecordsBtn');
  if (clearRecordsBtn) {
    clearRecordsBtn.addEventListener('click', function() {
      if (confirm('Weet je zeker dat je alle records wilt verwijderen?')) {
        localStorage.removeItem('records');
        showClearMessage('Alle records verwijderd!', '#4ecdc4');
        setTimeout(showStorageStatus, 1000); // Update status after message
      }
    });
  }
  
  // Clear Carts
  const clearCartsBtn = document.getElementById('clearCartsBtn');
  if (clearCartsBtn) {
    clearCartsBtn.addEventListener('click', function() {
      if (confirm('Weet je zeker dat je alle winkelwagens wilt verwijderen?')) {
        // Clear all cart data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cart_')) {
            localStorage.removeItem(key);
          }
        });
        // Also clear guest cart
        localStorage.removeItem('cart_guest');
        sessionStorage.removeItem('cart_guest');
        showClearMessage('Alle winkelwagens verwijderd!', '#45b7d1');
        setTimeout(showStorageStatus, 1000); // Update status after message
      }
    });
  }
  
  // Clear Specials
  const clearSpecialsBtn = document.getElementById('clearSpecialsBtn');
  if (clearSpecialsBtn) {
    clearSpecialsBtn.addEventListener('click', function() {
      if (confirm('Weet je zeker dat je alle specials wilt verwijderen?')) {
        localStorage.removeItem('specials');
        showClearMessage('Alle specials verwijderd!', '#f7b731');
        setTimeout(showStorageStatus, 1000); // Update status after message
      }
    });
  }
  
  // Clear Orders
  const clearOrdersBtn = document.getElementById('clearOrdersBtn');
  if (clearOrdersBtn) {
    clearOrdersBtn.addEventListener('click', function() {
      if (confirm('Weet je zeker dat je alle bestellingen wilt verwijderen?')) {
        localStorage.removeItem('orders');
        showClearMessage('Alle bestellingen verwijderd!', '#ff8c42');
        setTimeout(showStorageStatus, 1000); // Update status after message
      }
    });
  }
  
  // Clear All Storage
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function() {
      if (confirm('⚠️ WAARSCHUWING: Dit zal ALLE localStorage data verwijderen!\n\nJe zult opnieuw moeten inloggen en alle data zal verloren gaan.\n\nWeet je dit zeker?')) {
        localStorage.clear();
        sessionStorage.clear();
        const output = document.getElementById('output');
        if (output) {
          output.innerHTML = '<p style="color: #e74c3c; font-size: 18px;"><strong>🗑️ ALLE localStorage data verwijderd!</strong><br>Je kunt nu de hoofdpagina verversen om opnieuw te beginnen.</p>';
        }
        // Update status after clearing
        setTimeout(showStorageStatus, 2000);
      }
    });
  }
  
  // Refresh Status
  const refreshStatusBtn = document.getElementById('refreshStatusBtn');
  if (refreshStatusBtn) {
    refreshStatusBtn.addEventListener('click', function() {
      showStorageStatus();
    });
  }
  
  // Back to Admin Panel
  const backToAdminBtn = document.getElementById('backToAdminBtn');
  if (backToAdminBtn) {
    backToAdminBtn.addEventListener('click', function() {
      // Store flag that user is returning to admin panel
  // localStorage disabled in portfolio mode
      window.location.href = 'index.html#adminPanel';
    });
  }
  
  // Show status on load
  showStorageStatus();
}

function showClearMessage(message, color) {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = `<p style="color: ${color};"><strong>✅ ${message}</strong></p>`;
  }
}

function showStorageStatus() {
  const output = document.getElementById('output');
  if (!output) return;
  
  let status = '<h3>📊 LocalStorage Status:</h3>';
  status += '<ul>';
  
  // Users info
  const usersData = localStorage.getItem('users');
  if (usersData) {
    try {
      const users = JSON.parse(usersData);
      const userCount = Object.keys(users).length;
      status += `<li><strong>Users:</strong> ${userCount} gebruikers geregistreerd</li>`;
    } catch (e) {
      status += `<li><strong>Users:</strong> Data aanwezig (corrupt)</li>`;
    }
  } else {
    status += `<li><strong>Users:</strong> Geen gebruikers</li>`;
  }
  
  // Records info
  const recordsData = localStorage.getItem('records');
  if (recordsData) {
    try {
      const records = JSON.parse(recordsData);
      status += `<li><strong>Records:</strong> ${records.length} platen in database</li>`;
    } catch (e) {
      status += `<li><strong>Records:</strong> Data aanwezig (corrupt)</li>`;
    }
  } else {
    status += `<li><strong>Records:</strong> Geen platen</li>`;
  }
  
  // Specials info
  const specialsData = localStorage.getItem('specials');
  if (specialsData) {
    try {
      const specials = JSON.parse(specialsData);
      status += `<li><strong>Specials:</strong> ${specials.length} speciale aanbiedingen</li>`;
    } catch (e) {
      status += `<li><strong>Specials:</strong> Data aanwezig (corrupt)</li>`;
    }
  } else {
    status += `<li><strong>Specials:</strong> Geen speciale aanbiedingen</li>`;
  }
  
  // Carts info
  let cartCount = 0;
  let totalCartItems = 0;
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cart_')) {
      cartCount++;
      try {
        const cartData = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(cartData)) {
          cartData.forEach(item => {
            totalCartItems += item.qty || 1; // Sum quantities, not just cart length
          });
        }
      } catch (e) {
        // Ignore corrupt cart data
      }
    }
  });
  
  // Also check guest cart
  const guestCartData = localStorage.getItem('cart_guest');
  if (guestCartData) {
    try {
      const guestCart = JSON.parse(guestCartData);
      if (Array.isArray(guestCart)) {
        cartCount++;
        guestCart.forEach(item => {
          totalCartItems += item.qty || 1;
        });
      }
    } catch (e) {
      // Ignore corrupt guest cart
    }
  }
  
  status += `<li><strong>Shopping Carts:</strong> ${cartCount} winkelwagens met ${totalCartItems} items totaal</li>`;
  
  // Orders info
  const ordersData = localStorage.getItem('orders');
  if (ordersData) {
    try {
      const orders = JSON.parse(ordersData);
      if (Array.isArray(orders)) {
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);
        status += `<li><strong>Orders:</strong> ${orders.length} bestellingen totaal (${pendingOrders} wachtend), €${totalRevenue.toFixed(2)} omzet</li>`;
      } else {
        status += `<li><strong>Orders:</strong> Data aanwezig (corrupt)</li>`;
      }
    } catch (e) {
      status += `<li><strong>Orders:</strong> Data aanwezig (corrupt)</li>`;
    }
  } else {
    status += `<li><strong>Orders:</strong> Geen bestellingen</li>`;
  }
  
  // Current user info
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    // currentUser is stored as a string, not JSON
    status += `<li><strong>Current User:</strong> ${currentUserData} is ingelogd</li>`;
  } else {
    status += `<li><strong>Current User:</strong> Niemand ingelogd</li>`;
  }
  
  // Total storage usage
  let totalSize = 0;
  Object.keys(localStorage).forEach(key => {
    totalSize += localStorage.getItem(key).length;
  });
  const sizeInKB = (totalSize / 1024).toFixed(2);
  status += `<li><strong>Storage Usage:</strong> ${sizeInKB} KB gebruikt</li>`;
  
  status += '</ul>';
  
  // Add timestamp
  const now = new Date();
  status += `<p><em>Laatste update: ${now.toLocaleString('nl-BE')}</em></p>`;
  
  output.innerHTML = status;
}

// Initialize clear storage page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the clear storage page
  if (document.body.classList.contains('clear-storage-container')) {
    initClearStoragePage();
  }
  
  // Add test order for demo (remove this in production)
  addTestOrderIfEmpty();
});

// Add test order for demonstration (remove in production)
function addTestOrderIfEmpty() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  if (orders.length === 0) {
    const testOrder = {
      id: 'DV' + Date.now(),
      items: [
        {
          artist: 'Daft Punk',
          title: 'Random Access Memories',
          format: 'LP',
          price: 29.95,
          quantity: 1
        },
        {
          artist: 'Aphex Twin',
          title: 'Selected Ambient Works',
          format: 'LP',
          price: 24.95,
          quantity: 1
        }
      ],
      customer: {
        email: 'test@example.com',
        firstName: 'Jan',
        lastName: 'Janssen'
      },
      shipping: {
        cost: 5.95,
        isFree: false,
        isFree: false,
        destination: 'België',
        weight: 0.36
      },
      totals: {
        subtotal: 54.90,
        shipping: 5.95,
        total: 60.85
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      trackingNumber: null
    };
    
    orders.push(testOrder);
  // localStorage disabled in portfolio mode
  }
}

// Ensure info popup close button always works
window.addEventListener('DOMContentLoaded', function() {
  var closeBtn = document.getElementById('closeItemInfoBtn');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      e.preventDefault();
      document.getElementById('itemInfoModal').classList.remove('open');
    };
  }
  var modal = document.getElementById('itemInfoModal');
  if (modal) {
    modal.addEventListener('mousedown', function(e) {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
});

// Info popup logic
function showItemInfoPopup(item) {
  const modal = document.getElementById('itemInfoModal');
  if (!modal) return;
  document.getElementById('itemInfoImg').src = item.img || 'assets/Logo-DV1.png';
  document.getElementById('itemInfoTitle').textContent = item.title || '';
  document.getElementById('itemInfoArtist').textContent = item.artist || '';
  document.getElementById('itemInfoPrice').textContent = item.salePrice ? `€${item.salePrice.toFixed(2)} (Sale)` : `€${item.price.toFixed(2)}`;
  document.getElementById('itemInfoDesc').textContent = item.desc || '';
  modal.classList.add('open');
  // Attach close event every time popup opens to ensure it works
  const closeBtn = document.getElementById('closeItemInfoBtn');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      e.preventDefault();
      modal.classList.remove('open');
    };
  }
  // Hide modal on outside click
  modal.addEventListener('mousedown', function(e) {
    if (e.target === modal) modal.classList.remove('open');
  }, { once: true });
}