document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('product-form');
    loadProducts();

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(productForm);
        addProduct(formData);
    });
});

function loadProducts() {
    fetch('/api/products',{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => response.json())
        .then(products => {
            const tableBody = document.querySelector('#products-table tbody');
            tableBody.innerHTML = '';
            products.forEach(addProductToTable);
        })
        .catch(error => console.error('Error loading products:', error));
}

function addProduct(formData) {
    formData.append('productType', 'multi'); // ou 'mono' selon le cas
    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(product => {
        console.log('Received product from server:', product);
        addProductToTable(product);
        document.getElementById('product-form').reset();
        showNotification('Product added successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(`Failed to add product: ${error.message}`, 'error');
    });
}

function addProductToTable(product) {
    const tableBody = document.querySelector('#products-table tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${product.asin}</td>
        <td>${product.brand}</td>
        <td>${product.name}</td>
        <td>${product.score}</td>
        <td>${product.rank}</td>
        <td>${product.marketplace}</td>
        <td>
            <button onclick="toggleActivation('${product._id}', ${product.isActive})" class="action-button ${product.isActive ? 'active' : 'inactive'}">
                ${product.isActive ? 'Yes' : 'No'}
            </button>
        </td>
        <td>
            <button onclick="editProduct('${product._id}')" class="action-button edit-button">Modifier</button>
            <button onclick="deleteProduct('${product._id}')" class="action-button delete-button">Supprimer</button>
        </td>
    `;
}

window.toggleActivation = function(id, currentStatus) {
    const newStatus = !currentStatus;
    fetch(`/api/products/${id}/toggle-activation`, {
        method: 'PUT',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(updatedProduct => {
        const button = document.querySelector(`button[onclick="toggleActivation('${id}', ${currentStatus})"]`);
        button.textContent = newStatus ? 'Yes' : 'No';
        button.onclick = () => toggleActivation(id, newStatus);
        showNotification(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update product activation status', 'error');
    });
}

window.editProduct = function(id) {
    console.log("Editing product with id:", id);
    fetch(`/api/products/${id}`,{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(product => {
            console.log("Product data:", product);
            document.getElementById('asin').value = product.asin;
            document.getElementById('brand').value = product.brand;
            document.getElementById('name').value = product.name;
            document.getElementById('score').value = product.score;
            document.getElementById('rank').value = product.rank;
            document.getElementById('marketplace').value = product.marketplace;
            document.getElementById('buttonText').value = product.buttonText;
            document.getElementById('buttonColor').value = product.buttonColor;
            
            const form = document.getElementById('product-form');
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Modifier le produit';
            form.onsubmit = (e) => {
                e.preventDefault();
                updateProduct(id, new FormData(form));
            };
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Échec de la récupération du produit', 'error');
        });
}

window.deleteProduct = function(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        fetch(`/api/products/${id}`, { 
            method: 'DELETE',
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        } })
            .then(response => {
                if (response.ok) {
                    loadProducts();
                    showNotification('Produit supprimé avec succès');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Échec de la suppression du produit', 'error');
            });
    }
}

function updateProduct(id, formData) {
    fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: formData
    })
    .then(response => response.json())
    .then(updatedProduct => {
        loadProducts();
        resetForm();
        showNotification('Product updated successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update product', 'error');
    });
}

function resetForm() {
    const form = document.getElementById('product-form');
    form.reset();
    form.onsubmit = (e) => {
        e.preventDefault();
        addProduct(new FormData(form));
    };
}

function showNotification(message, type = 'success') {
    // Implement this function to show notifications
    alert(message);
}