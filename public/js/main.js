document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    loadDesignSettings();
    loadProducts();
    captureGclid();
    
    document.querySelector('.container').addEventListener('click', function(e) {
        if (e.target.classList.contains('view-button')) {
            e.preventDefault();
            const asin = e.target.getAttribute('data-asin');
            const marketplace = e.target.getAttribute('data-marketplace');
            window.redirectToAmazon(asin, marketplace);
        }
    });
});

function loadProducts() {
    fetch('/api/active-products',{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => response.json())
        .then(products => {
            console.log('Received products:', products);
            const container = document.querySelector('.container');
            container.innerHTML = '';
            products.forEach((product, index) => {
                container.innerHTML += `
                    <div class="product">
                        <span class="rank ${index === 0 ? 'rank-1' : ''}">#${product.rank}</span>
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <div class="product-brand">${product.brand}</div>
                            <div class="product-name">${product.name}</div>
                        </div>
                        <div class="score-button-container">
                            <div class="score-container">
                                <div class="score">${product.score}</div>
                                <div class="score-label">score</div>
                            </div>
                            <a href="#" class="view-button" data-asin="${product.asin}" data-marketplace="${product.marketplace}" style="background-color: ${product.buttonColor}">${product.buttonText}</a>
                        </div>
                    </div>
                `;
            });
            attachViewButtonListeners();
        })
        .catch(error => console.error('Error:', error));
}

function attachViewButtonListeners() {
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const asin = this.getAttribute('data-asin');
            const marketplace = this.getAttribute('data-marketplace');
            trackClickAndRedirect(asin, marketplace);
        });
    });
}

function captureGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');
    if (gclid) {
        localStorage.setItem('gclid', gclid);
    }
}

function getGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gclid') || `sim_gclid_${Date.now()}`;
}

async function redirectToAmazon(asin, marketplace, gclid) {
    const timestamp = Date.now();
    const affiliateTag = await getAffiliateTag();
    const marketplaceUrls = {
        'US': 'https://www.amazon.com',
        'UK': 'https://www.amazon.co.uk',
        'FR': 'https://www.amazon.fr',
        'DE': 'https://www.amazon.de'
    };
    const baseUrl = marketplaceUrls[marketplace] || marketplaceUrls['US'];
    
    let redirectUrl = `${baseUrl}/dp/${asin}?tag=${affiliateTag}&timestamp=${timestamp}`;
    if (gclid) {
        redirectUrl += `&gclid=${gclid}`;
    }
    console.log('Redirecting to:', redirectUrl); // Pour le débogage
    window.open(redirectUrl, '_blank');
}

async function getAffiliateTag() {
    try {
        const response = await fetch('/api/affiliate-tag',{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }});
        const data = await response.json();
        console.log('Affiliate tag:', data.affiliateTag); // Pour le débogage
        return data.affiliateTag;
    } catch (error) {
        console.error('Error fetching affiliate tag:', error);
        return 'DEFAULT_AFFILIATE_TAG';
    }
}

function loadDesignSettings() {
    fetch('/api/design-settings',{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => response.json())
        .then(settings => {
            applyDesignSettings(settings);
        })
        .catch(error => console.error('Error loading design settings:', error));
}

function applyDesignSettings(settings) {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const logo = document.querySelector('.logo');
    const footerContent = document.querySelector('.footer-content');

    if (settings.logoType === 'text') {
        logo.textContent = settings.logoText;
        logo.style.color = settings.logoFooterColor;
    } else {
        logo.innerHTML = `<img src="${settings.logoImage}" alt="Logo">`;
    }

    header.style.backgroundColor = settings.headerColor;
    footer.style.backgroundColor = settings.footerColor;
    
    if (footerContent) {
        footerContent.textContent = settings.footerText;
        footerContent.style.color = settings.logoFooterColor;
    }
}

function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}

async function trackClickAndRedirect(asin, marketplace) {
    const timestamp = Date.now();
    const gclid = getGclid();
    
    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asin, timestamp, marketplace, gclid }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Click tracked successfully');
    } catch (error) {
        console.error('Error tracking click:', error);
    } finally {
        redirectToAmazon(asin, marketplace, gclid);
    }
}