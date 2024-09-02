document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const funnelId = urlParams.get('id');

    if (funnelId) {
        loadFunnelData(funnelId);
    } else {
        console.error('No funnel ID provided');
    }
});

function loadFunnelData(funnelId) {
    console.log('Loading funnel data for ID:', funnelId);
    Promise.all([
        fetch(`/api/funnels/${funnelId}/products`).then(response => response.json()),
        fetch(`/api/design-settings/${funnelId}`).then(response => response.json()),
        fetch(`/api/tracking-settings/${funnelId}`).then(response => response.json())
    ])
    .then(([products, designSettings, trackingSettings]) => {
        console.log('Products:', products);
        console.log('Design Settings:', designSettings);
        console.log('Tracking Settings:', trackingSettings);
        applyDesignSettings(designSettings);
        displayProducts(products);
        applyTrackingScripts(trackingSettings);
    })
    .catch(error => {
        console.error('Error loading funnel data:', error);
        alert('Error loading funnel data. Please try again.');
    });
}

function displayMonoProduct(product) {
    const container = document.getElementById('product-container');
    container.innerHTML = `
        <div class="product mono-product">
            <img src="${product.imageUrl}" alt="${product.productTitle}" class="product-image">
            <div class="product-info">
                <h1>${product.productTitle}</h1>
                <p class="price">${product.price} ${product.currency}</p>
                <ul>
                    ${product.bulletPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
                <a href="#" class="view-button" data-asin="${product.asin}" data-marketplace="${product.marketplace}">${product.ctaText}</a>
            </div>
        </div>
    `;
    attachViewButtonListeners();
}

function applyDesignSettings(settings) {
    const logo = document.getElementById('logo');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const footerContent = document.getElementById('footer-content');

    if (settings.logoType === 'text') {
        logo.textContent = settings.logoText;
        logo.style.color = settings.logoFooterColor;
    } else {
        logo.innerHTML = `<img src="${settings.logoImage}" alt="Logo">`;
    }

    header.style.backgroundColor = settings.headerColor;
    footer.style.backgroundColor = settings.footerColor;
    footerContent.style.color = settings.logoFooterColor;
    footerContent.textContent = settings.footerText;

    // Assurez-vous que le corps de la page a un fond blanc
    document.body.style.backgroundColor = '#ffffff';
}

function displayProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    if (window.innerWidth <= 767) {
        displayMobileProducts(products, container);
    } else {
        displayDesktopProducts(products, container);
    }
    
    attachViewButtonListeners();
}

function displayMobileProducts(products, container) {
    products.forEach((product, index) => {
        container.innerHTML += `
            <div class="product mobile-product">
                <span class="rank ${index === 0 ? 'rank-1' : ''}">#${product.rank}</span>
                <div class="mobile-product-image-score">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <div class="score-container">
                        <div class="score">${product.score}</div>
                        <div class="score-label">score</div>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-name">${product.name}</div>
                </div>
                <a href="#" class="view-button" data-asin="${product.asin}" data-marketplace="${product.marketplace}" style="background-color: ${product.buttonColor}">${product.buttonText}</a>
            </div>
        `;
    });
}

function displayDesktopProducts(products, container) {
    products.forEach((product, index) => {
        container.innerHTML += `
            <div class="product desktop-product">
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
}

// Ajoutez cette fonction pour gérer le redimensionnement de la fenêtre
function handleResize() {
    const products = document.querySelectorAll('.product');
    if (products.length > 0) {
        const container = document.getElementById('product-container');
        container.innerHTML = '';
        if (window.innerWidth <= 767) {
            Array.from(products).forEach(product => displayMobileProducts([extractProductData(product)], container));
        } else {
            Array.from(products).forEach(product => displayDesktopProducts([extractProductData(product)], container));
        }
        attachViewButtonListeners();
    }
}

// Fonction pour extraire les données du produit à partir de l'élément HTML
function extractProductData(productElement) {
    return {
        rank: productElement.querySelector('.rank').textContent.slice(1),
        imageUrl: productElement.querySelector('.product-image').src,
        name: productElement.querySelector('.product-name').textContent,
        brand: productElement.querySelector('.product-brand').textContent,
        score: productElement.querySelector('.score').textContent,
        asin: productElement.querySelector('.view-button').dataset.asin,
        marketplace: productElement.querySelector('.view-button').dataset.marketplace,
        buttonColor: productElement.querySelector('.view-button').style.backgroundColor,
        buttonText: productElement.querySelector('.view-button').textContent
    };
}

// Ajoutez un écouteur d'événement pour le redimensionnement de la fenêtre
window.addEventListener('resize', handleResize);

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
    
    const timestamp = Date.now();
    const gclid = getGclid();
    const funnelId = getFunnelIdFromUrl();

    if (!funnelId) {
        console.error('Cannot redirect: Funnel ID is missing');
        alert('Une erreur s\'est produite. Funnel ID manquant.');
        return;
    }

    try {
        const clickResponse = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ asin, timestamp, marketplace, gclid, funnelId }),
        });
        if (!clickResponse.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Click tracked successfully');

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
    } catch (error) {
        console.error('Error during redirection:', error);
        alert('Une erreur s\'est produite lors de la redirection. Veuillez réessayer.');
    }
}

async function getAffiliateTag() {
    try {
        const response = await fetch('/api/affiliate-tag');
        const data = await response.json();
        return data.affiliateTag;
    } catch (error) {
        console.error('Error fetching affiliate tag:', error);
        return 'DEFAULT_AFFILIATE_TAG'; // Utilisez une valeur par défaut si la requête échoue
    }
}

function getFunnelIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const funnelId = urlParams.get('id');
    if (!funnelId) {
        console.error('Funnel ID not found in URL');
    }
    return funnelId;
}

function getGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gclid') || `sim_gclid_${Date.now()}`;
}

async function loadTrackingScripts(funnelId) {
    try {
        const response = await fetch(`/api/tracking-settings/${funnelId}`);
        const trackingSettings = await response.json();

        if (trackingSettings.googleTagManager) {
            const gtmScript = document.createElement('script');
            gtmScript.innerHTML = `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${trackingSettings.googleTagManager}');
            `;
            document.head.appendChild(gtmScript);
        }

        if (trackingSettings.googleAdsId) {
            const gadsScript = document.createElement('script');
            gadsScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingSettings.googleAdsId}`;
            gadsScript.async = true;
            document.head.appendChild(gadsScript);

            const gadsConfigScript = document.createElement('script');
            gadsConfigScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${trackingSettings.googleAdsId}');
            `;
            document.head.appendChild(gadsConfigScript);
        }
    } catch (error) {
        console.error('Error loading tracking scripts:', error);
    }
}

function applyTrackingScripts(trackingSettings) {
    // Google Tag Manager
    if (trackingSettings.googleTagManager) {
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',trackingSettings.googleTagManager);
    }

    // Google Ads
    if (trackingSettings.googleAdsId) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingSettings.googleAdsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', trackingSettings.googleAdsId);

        if (trackingSettings.googleAdsConversionLabel) {
            gtag('event', 'conversion', {'send_to': `${trackingSettings.googleAdsId}/${trackingSettings.googleAdsConversionLabel}`});
        }
    }
}

function populateProductData(product) {
    console.log('Populating product data:', product);

    document.querySelector('.logo').textContent = product.logoText;
    
    const productImage = document.querySelector('.product-image img');
    if (productImage) {
        productImage.src = product.imageUrl;
        productImage.alt = product.productTitle;
    }

    document.querySelector('.product-info h1').textContent = product.productTitle;
    document.querySelector('.rating .reviews').textContent = `${product.reviews} avis`;
    document.querySelector('.price').textContent = `${product.price} ${product.currency}`;

    // Corriger le chargement des bullet points
    const bulletPointsList = document.querySelector('.product-info ul');
    bulletPointsList.innerHTML = product.bulletPoints.map(point => `<li>${point}</li>`).join('');

    const ctaButton = document.querySelector('#cta-button');
    ctaButton.textContent = product.ctaText;
    ctaButton.style.backgroundColor = product.ctaBgColor;
    ctaButton.style.color = product.ctaTextColor;

    ctaButton.addEventListener('click', function(e) {
        e.preventDefault();
        generateAmazonUrl(product).then(url => {
            if (url) {
                console.log('Redirecting to:', url);
                window.open(url, '_blank');
            } else {
                console.error('Failed to generate Amazon URL');
            }
        });
    });

    document.querySelector('#description p').textContent = product.description;

    const characteristicsGrid = document.querySelector('.characteristics-grid');
    characteristicsGrid.innerHTML = product.characteristics.map(char => `
        <div class="characteristic">
            <span class="label">${char.name}</span>
            <span class="value">${char.value}</span>
        </div>
    `).join('');
}