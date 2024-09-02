document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('mono-product-form');
  const addBulletPointBtn = document.getElementById('add-bullet-point');
  const addCharacteristicBtn = document.getElementById('add-characteristic');

  loadProducts();

  form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      addMonoProduct(formData);
  });

  addBulletPointBtn.addEventListener('click', addBulletPoint);
  addCharacteristicBtn.addEventListener('click', addCharacteristic);
});

function loadProducts() {
  fetch('/api/mono-products')
      .then(response => response.json())
      .then(products => {
          const tableBody = document.querySelector('#mono-products-table tbody');
          tableBody.innerHTML = '';
          products.forEach(addProductToTable);
      })
      .catch(error => console.error('Error:', error));
}

function addMonoProduct(formData) {
  // Traitement spécial pour les caractéristiques
  const characteristicNames = Array.from(document.querySelectorAll('input[name="characteristic-names[]"]'))
    .map(input => input.value)
    .filter(value => value.trim() !== '');
  const characteristicValues = Array.from(document.querySelectorAll('input[name="characteristic-values[]"]'))
    .map(input => input.value)
    .filter(value => value.trim() !== '');

  // Supprime les anciennes caractéristiques de formData
  formData.delete('characteristic-names[]');
  formData.delete('characteristic-values[]');

  // Ajoute les nouvelles caractéristiques
  characteristicNames.forEach((name, index) => {
    formData.append('characteristic-names[]', name);
    formData.append('characteristic-values[]', characteristicValues[index] || '');
  });

  fetch('/api/mono-products', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(product => {
    console.log('Mono product saved:', product);
    addProductToTable(product);
    document.getElementById('mono-product-form').reset();
    showNotification('Mono product added successfully');
  })
  .catch(error => {
    console.error('Error:', error);
    showNotification('Failed to add mono product', 'error');
  });
}

function addProductToTable(product) {
  const tableBody = document.querySelector('#mono-products-table tbody');
  const row = tableBody.insertRow();
  row.innerHTML = `
      <td>${product.asin || 'N/A'}</td>
      <td>${product.productTitle || 'N/A'}</td>
      <td>${product.price ? product.price.toFixed(2) : 'N/A'} ${product.currency || ''}</td>
      <td>${product.marketplace || 'N/A'}</td>
      <td>
          <button onclick="editProduct('${product._id}')">Edit</button>
          <button onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
  `;
}

function addBulletPoint(value = '') {
  const container = document.getElementById('bullet-points-container');
  const bulletPointsCount = container.children.length;
  if (bulletPointsCount < 5) {
      const input = document.createElement('div');
      input.className = 'form-group';
      input.innerHTML = `<input type="text" name="bulletPoints[]" value="${value}" placeholder="Bullet point ${bulletPointsCount + 1}">`;
      container.appendChild(input);
  }
}

function addCharacteristic(name = '', value = '') {
  const container = document.getElementById('characteristics-container');
  const characteristicsCount = container.children.length;
  if (characteristicsCount < 8) {
      const pair = document.createElement('div');
      pair.className = 'characteristic-pair';
      pair.innerHTML = `
          <input type="text" name="characteristic-names[]" value="${name}" placeholder="Characteristic name">
          <input type="text" name="characteristic-values[]" value="${value}" placeholder="Characteristic value">
      `;
      container.appendChild(pair);
  }
}

window.editProduct = function(id) {
  fetch(`/api/mono-products/${id}`)
      .then(response => response.json())
      .then(product => {
          fillFormWithProductData(product);
          const submitButton = document.querySelector('#mono-product-form button[type="submit"]');
          submitButton.textContent = 'Update Mono Product';
          submitButton.onclick = function(e) {
              e.preventDefault();
              updateMonoProduct(id);
          };
      })
      .catch(error => console.error('Error:', error));
};

function fillFormWithProductData(product) {
  document.getElementById('asin').value = product.asin;
  document.getElementById('marketplace').value = product.marketplace;
  document.getElementById('logo-text').value = product.logoText;
  document.getElementById('product-title').value = product.productTitle;
  document.getElementById('price').value = product.price;
  document.getElementById('currency').value = product.currency;
  document.getElementById('reviews').value = product.reviews;
  document.getElementById('description').value = product.description;
  document.getElementById('cta-text').value = product.ctaText;
  document.getElementById('cta-bg-color').value = product.ctaBgColor;
  document.getElementById('cta-text-color').value = product.ctaTextColor;

  const bulletPointsContainer = document.getElementById('bullet-points-container');
    bulletPointsContainer.innerHTML = '';
    product.bulletPoints.forEach(point => addBulletPoint(point));

  const characteristicsContainer = document.getElementById('characteristics-container');
  characteristicsContainer.innerHTML = '';
  product.characteristics.forEach(char => addCharacteristic(char.name, char.value));
}

function updateMonoProduct(id) {
  const form = document.getElementById('mono-product-form');
  const formData = new FormData(form);

  const productData = {
    asin: document.getElementById('asin').value,
    marketplace: document.getElementById('marketplace').value,
    logoText: document.getElementById('logo-text').value,
    productTitle: document.getElementById('product-title').value,
    price: document.getElementById('price').value,
    currency: document.getElementById('currency').value,
    reviews: document.getElementById('reviews').value,
    bulletPoints: Array.from(formData.getAll('bulletPoints[]')).filter(bp => bp.trim() !== ''),
    description: document.getElementById('description').value,
    'characteristic-names[]': formData.getAll('characteristic-names[]'),
    'characteristic-values[]': formData.getAll('characteristic-values[]'),
    ctaText: document.getElementById('cta-text').value,
    ctaBgColor: document.getElementById('cta-bg-color').value,
    ctaTextColor: document.getElementById('cta-text-color').value
  };

  // Supprimez la ligne qui fait référence à imageUrl, car ce champ n'existe pas dans le formulaire

  console.log('Updating product with data:', productData);

  fetch(`/api/mono-products/${id}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(updatedProduct => {
      console.log('Product updated successfully:', updatedProduct);
      loadProducts();
      resetForm();
      alert('Product updated successfully!');
  })
  .catch(error => {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
  });
}

function resetForm() {
  const form = document.getElementById('mono-product-form');
  form.reset();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Create Mono Product';
  submitButton.onclick = null;
}

window.deleteProduct = function(id) {
  if (confirm('Are you sure you want to delete this product?')) {
      fetch(`/api/mono-products/${id}`, { method: 'DELETE' })
          .then(response => response.json())
          .then(() => {
              loadProducts();
              showNotification('Mono product deleted successfully');
          })
          .catch(error => {
              console.error('Error:', error);
              showNotification('Failed to delete mono product', 'error');
          });
  }
};

function showNotification(message, type = 'success') {
  // Implement this function to show notifications
  alert(message);
}