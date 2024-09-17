document.addEventListener('DOMContentLoaded', function() {
    const createFunnelForm = document.getElementById('create-funnel-form');
    const funnelsTable = document.getElementById('funnels-table').querySelector('tbody');
    const modal = document.getElementById('product-selection-modal');
    const productList = document.getElementById('product-list');
    const saveProductsButton = document.getElementById('save-products');
    const closeModalButton = document.getElementById('close-modal');

    let currentFunnelId = null;

    loadFunnels();
    
    createFunnelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(createFunnelForm);
        createFunnel(Object.fromEntries(formData));
    });

    saveProductsButton.addEventListener('click', saveProductsToFunnel);
    closeModalButton.addEventListener('click', () => modal.style.display = 'none');

    function loadFunnels() {
        fetch('/api/funnels',{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }})
            .then(response => response.json())
            .then(funnels => {
                renderFunnels(funnels);
            })
            .catch(error => console.error('Error loading funnels:', error));
    }

    function createFunnel(funnelData) {
        if (!funnelData.templateType.includes('Product')) {
            funnelData.templateType = funnelData.templateType.charAt(0).toUpperCase() + funnelData.templateType.slice(1) + " Product";
        }
        console.log('Creating funnel:', {...funnelData,userId : localStorage.getItem('userId')});
        fetch('/api/funnels', {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...funnelData,userId : localStorage.getItem('userId')}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(newFunnel => {
            console.log('Funnel created successfully:', newFunnel);
            loadFunnels();
            createFunnelForm.reset();
        })
        .catch(error => {
            console.error('Error creating funnel:', error);
            alert('Failed to create funnel. Please try again.');
        });
    }

    function renderFunnels(funnels) {
        funnelsTable.innerHTML = '';
        funnels.forEach(funnel => {
            const row = funnelsTable.insertRow();
            row.innerHTML = `
                <td>${funnel.name}</td>
                <td>${funnel.templateType}</td>
                <td>${funnel.customDomain || 'N/A'}</td>
                <td>
                    <button onclick="deleteFunnel('${funnel._id}')" class="action-button delete">Delete</button>
                    <button onclick="manageProducts('${funnel._id}')" class="action-button manage">Manage Products</button>
                    <button onclick="viewLandingPage('${funnel._id}')" class="action-button landing">Landing Page</button>
                </td>
            `;
        });
    }

    window.deleteFunnel = function(funnelId) {
        if (confirm('Are you sure you want to delete this funnel?')) {
            fetch(`/api/funnels/${funnelId}`, { 
                method: 'DELETE',
                headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }})
                .then(response => {
                    if (response.ok) {
                        loadFunnels();
                    } else {
                        throw new Error('Failed to delete funnel');
                    }
                })
                .catch(error => console.error('Error deleting funnel:', error));
        }
    };

    window.manageProducts = function(funnelId) {
        currentFunnelId = funnelId;
        modal.style.display = 'block';
        loadProductsForFunnel(funnelId);
    };

    window.viewLandingPage = function(funnelId) {
        const userId = localStorage.getItem('userId')
        fetch(`/api/funnels/${funnelId}`,{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }})
            .then(response => response.json())
            .then(funnel => {
                console.log('Funnel data:', funnel);
                let url;
                if (funnel.templateType === 'Mono Product') {
                    url = `/mono-product.html?id=${funnelId}&userId=${userId}`;
                } else {
                    url = `/funnel-landing.html?id=${funnelId}&userId=${userId}`;
                }
                console.log('Opening URL:', url);
                window.open(url, '_blank');
            })
            .catch(error => {
                console.error('Error fetching funnel:', error);
                alert('Error loading funnel. Please try again.');
            });
    };

    function loadProductsForFunnel(funnelId) {
        console.log('Loading products for funnel:', funnelId);
        fetch(`/api/funnels/${funnelId}`,{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }})
            .then(res => res.json())
            .then(funnel => {
                console.log('Funnel data:', funnel);
                let productsPromise;
                if (funnel.templateType === 'Mono Product') {
                    productsPromise = fetch('/api/mono-products',{
                        headers: {
                        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }});
                } else {
                    productsPromise = fetch('/api/products',{
                        headers: {
                        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }});
                }
                return Promise.all([
                    productsPromise.then(res => res.json()),
                    fetch(`/api/funnels/${funnelId}/products`,{
                        headers: {
                        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }}).then(res => res.json())
                ]);
            })
            .then(([allProducts, funnelProducts]) => {
                console.log("All products:", allProducts);
                console.log("Funnel products:", funnelProducts);
                const funnelProductIds = funnelProducts.map(p => p._id);
                productList.innerHTML = allProducts.map(product => `
                    <div class="product-item">
                        <input type="checkbox" id="product-${product._id}" value="${product._id}" ${funnelProductIds.includes(product._id) ? 'checked' : ''}>
                        <label for="product-${product._id}">${product.name || product.productTitle} (${product.asin})</label>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error loading products:', error);
                productList.innerHTML = '<p>Error loading products. Please try again.</p>';
            });
    }


    function saveProductsToFunnel() {
        const selectedProductIds = Array.from(productList.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
    
        fetch(`/api/funnels/${currentFunnelId}/products`, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productIds: selectedProductIds }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save products');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Products saved successfully:', data);
            alert('Products saved to funnel successfully');
            modal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error saving products to funnel:', error);
            alert('Failed to save products. Please try again.');
        });
    }

    function addSearchFunctionality() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search products...';
        searchInput.className = 'product-search';
        productList.parentNode.insertBefore(searchInput, productList);
    
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll('.product-item').forEach(item => {
                const productName = item.textContent.toLowerCase();
                item.style.display = productName.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    function setupSearch() {
        const searchInput = document.getElementById('product-search');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#products-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    function loadProducts() {
        fetch('/api/active-products',{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }})
            .then(response => response.json())
            .then(products => {
                const tableBody = document.querySelector('#products-table tbody');
                tableBody.innerHTML = '';
                products.forEach(addProductToTable);
                setupSearch(); // Ajoutez cette ligne
            })
            .catch(error => console.error('Error loading products:', error));
    }

    function saveSelectedProducts() {
        const selectedProducts = [];
        document.querySelectorAll('#products-table tbody tr').forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                selectedProducts.push(row.dataset.productId);
            }
        });
    
        fetch('/api/save-funnel-products', {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedProducts }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Products saved successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to save products. Please try again.', 'error');
        });
    }

    function validateCustomDomain(domain) {
        const regex = /^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+\.?)$/i;
        return regex.test(domain);
    }

    

    function createOrUpdateFunnel(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const customDomain = formData.get('customDomain');
    
        if (customDomain && !validateCustomDomain(customDomain)) {
            alert('Invalid custom domain. Please enter a valid domain name.');
            return;
        }
    
        // Reste du code pour créer ou mettre à jour le funnel
        fetch('/api/funnels', {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Rafraîchir la liste des funnels ou rediriger
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


});