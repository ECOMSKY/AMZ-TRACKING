console.log('mono-product.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const funnelId = urlParams.get('id');

    if (funnelId) {
        console.log('Loading data for funnel:', funnelId);
        loadMonoProductData(funnelId);
    } else {
        console.error('No funnel ID provided');
    }
});

function loadMonoProductData(funnelId) {
    console.log('Starting to load mono product data');
    Promise.all([
        fetch(`/api/funnels/${funnelId}/products`,{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }}).then(response => response.json()),
        fetch(`/api/tracking-settings/${funnelId}`,{
            headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }}).then(response => response.json())
    ])
    .then(([products, trackingSettings]) => {
        console.log('Fetched products:', products);
        console.log('Fetched tracking settings:', trackingSettings);
        if (products.length > 0) {
            const product = products[0];
            console.log('Product to display:', product);
            populateProductData(product);
            applyTrackingScripts(trackingSettings);
        } else {
            console.error('No product found for this funnel');
        }
    })
    .catch(error => console.error('Error loading mono product data:', error));
}

function applyDesignSettings(product) {
    const logo = document.querySelector('.logo');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    logo.textContent = product.logoText;
    logo.style.color = product.ctaTextColor; // Utiliser la couleur du texte CTA comme couleur du logo

    header.style.backgroundColor = '#ffffff'; // Couleur par défaut pour l'en-tête
    footer.style.backgroundColor = '#000000'; // Couleur par défaut pour le pied de page
    footer.style.color = '#ffffff'; // Couleur par défaut pour le texte du pied de page
    document.querySelector('.footer-content').textContent = '© 2024 All rights reserved.'; // Texte par défaut pour le pied de page
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


function generateAmazonUrl(product) {
    const gclid = getGclid();
    const timestamp = Date.now();
    const funnelId = getFunnelIdFromUrl(); // Assurez-vous d'avoir cette fonction dans ce fichier
    const userId = getUserIdFromUrl() ;
    return fetch('/api/generate-amazon-url', {
        method: 'POST',
        headers: {
            // 'Authorization' : `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            asin: product.asin,
            marketplace: product.marketplace,
            gclid: gclid,
            timestamp: timestamp,
            funnelId: funnelId
        }),
    })
    .then(response => response.json())
    .then(data => {
        return fetch('/api/click', {
            method: 'POST',
            headers: {
                // 'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId : userId,
                asin: product.asin,
                timestamp: timestamp,
                gclid: gclid,
                marketplace: product.marketplace,
                funnelId: funnelId
            }),
        }).then(() => data.url);
    })
    .catch(error => {
        console.error('Error generating Amazon URL or tracking click:', error);
        return null;
    });
}

// Ajoutez cette fonction si elle n'existe pas déjà
function getFunnelIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
// Ajoutez cette fonction si elle n'existe pas déjà
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

function applyTrackingScripts(trackingSettings) {
    if (trackingSettings.googleTagManager) {
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',trackingSettings.googleTagManager);
    }

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

function getGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gclid') || `sim_gclid_${Date.now()}`;
}