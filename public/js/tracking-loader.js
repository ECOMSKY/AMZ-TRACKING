document.addEventListener('DOMContentLoaded', function() {
    loadTrackingScripts();
    loadActiveProducts();
});

function loadTrackingScripts() {
    console.log('Tracking loader script started');
    fetch('/api/tracking-settings',{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => response.json())
        .then(settings => {
            console.log('Tracking settings:', settings);
            const scriptContainer = document.getElementById('tracking-scripts');
            scriptContainer.innerHTML = ''; // Nettoyer les scripts existants

            if (settings.googleTagManager) {
                console.log('Adding GTM script:', settings.googleTagManager);
                const gtmScript = document.createElement('script');
                gtmScript.innerHTML = `
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${settings.googleTagManager}');
                `;
                document.body.insertBefore(gtmScript, document.body.firstChild);
            }

            if (settings.googleAdsId) {
                const gtagScript = document.createElement('script');
                gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}`;
                gtagScript.async = true;
                scriptContainer.appendChild(gtagScript);

                const gtagConfigScript = document.createElement('script');
                gtagConfigScript.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${settings.googleAdsId}');
                `;
                scriptContainer.appendChild(gtagConfigScript);
            }
        })
        .catch(error => {
            console.error('Error loading tracking scripts:', error);
            console.log('Error details:', error.message, error.stack);
        });
}

function loadActiveProducts() {
    console.log('Loading active products');
    fetch('/api/active-products',{
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
        .then(products => {
            console.log('Active products loaded:', products);
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error loading active products:', error);
            console.log('Error details:', error.message, error.stack);
        });
}

function displayProducts(products) {
    const container = document.querySelector('.container');
    container.innerHTML = ''; // Nettoyer les produits existants

    products.forEach((product, index) => {
        const productHTML = `
            <div class="product">
                <span class="rank ${index === 0 ? 'rank-1' : ''}">#${product.rank}</span>
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-name">${product.name}</div>
                </div>
                <div class="score-button-container">
                    <div class="score-container">
                        <div class="score">${product.score.toFixed(1)}</div>
                        <div class="score-label">score</div>
                    </div>
                    <a href="#" class="view-button" data-asin="${product.asin}" data-marketplace="${product.marketplace}">${product.buttonText}</a>
                </div>
            </div>
        `;
        container.innerHTML += productHTML;
    });

    // Réattacher les event listeners pour les boutons "View on Amazon"
    attachViewButtonListeners();
}

function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
        <h3>${product.name}</h3>
        <p>Brand: ${product.brand}</p>
        <p>ASIN: ${product.asin}</p>
        <p>Score: ${product.score}</p>
        <p>Rank: ${product.rank}</p>
        <button style="background-color: ${product.buttonColor};" 
                onclick="window.open('https://www.amazon.${product.marketplace}/dp/${product.asin}?tag=${product.affiliateTag}', '_blank')">
            ${product.buttonText}
        </button>
    `;
    return productDiv;
}

function attachViewButtonListeners() {
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const asin = this.getAttribute('data-asin');
            const marketplace = this.getAttribute('data-marketplace');
            redirectToAmazon(asin, marketplace);
        });
    });
}

async function redirectToAmazon(asin, marketplace) {
    console.log(`Redirecting to Amazon for ASIN: ${asin} in marketplace: ${marketplace}`);
    
    // Tracking du clic
    const timestamp = Date.now();
    const gclid = getGclid();
    
    try {
        const clickResponse = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asin, timestamp, marketplace, gclid }),
        });
        if (!clickResponse.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Click tracked successfully');
    } catch (error) {
        console.error('Error tracking click:', error);
    }

    // Redirection
    const affiliateTag = await getAffiliateTag();
    const marketplaceUrls = {
        'US': 'https://www.amazon.com',
        'UK': 'https://www.amazon.co.uk',
        'FR': 'https://www.amazon.fr',
        'DE': 'https://www.amazon.de'
    };
    const baseUrl = marketplaceUrls[marketplace] || marketplaceUrls['US'];
    
    const redirectUrl = `${baseUrl}/dp/${asin}?tag=${affiliateTag}&timestamp=${timestamp}&gclid=${gclid}`;
    window.open(redirectUrl, '_blank');
}

window.redirectToAmazon = async function(asin, marketplace, gclid) {
    console.log(`Redirecting to Amazon for ASIN: ${asin} in marketplace: ${marketplace}`);
    const timestamp = Date.now();
    const affiliateTag = await getAffiliateTag();
    const marketplaceUrls = {
        'US': 'https://www.amazon.com',
        'UK': 'https://www.amazon.co.uk',
        'FR': 'https://www.amazon.fr',
        'DE': 'https://www.amazon.de'
    };
    const baseUrl = marketplaceUrls[marketplace] || marketplaceUrls['US'];
    
    const redirectUrl = `${baseUrl}/dp/${asin}?tag=${affiliateTag}&timestamp=${timestamp}&gclid=${gclid}`;
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
        return data.affiliateTag;
    } catch (error) {
        console.error('Error fetching affiliate tag:', error);
        return 'DEFAULT_AFFILIATE_TAG';
    }
}

function getGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gclid') || `sim_gclid_${Date.now()}`;
}