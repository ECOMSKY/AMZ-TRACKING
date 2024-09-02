# AMZ-TRACKING

AMZ-TRACKING est une application de suivi pour les produits Amazon, permettant de gérer des funnels de produits et de suivre les conversions.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
- [MongoDB](https://www.mongodb.com/try/download/community) (version 4.x ou supérieure)
- [Git](https://git-scm.com/downloads)

## Installation

1. Clonez le dépôt :
git clone https://github.com/ECOMSKY/AMZ-TRACKING.git

2. Naviguez dans le dossier du projet :
cd AMZ-TRACKING

3. Installez les dépendances :
npm install

4. Créez un fichier `.env` à la racine du projet et ajoutez les variables d'environnement suivantes :
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
AMAZON_ACCESS_KEY=votre_cle_acces_amazon
AMAZON_SECRET_KEY=votre_cle_secrete_amazon
AFFILIATE_TAG=votre_tag_affilie
GOOGLE_ADS_CLIENT_ID=votre_id_client_google_ads
GOOGLE_ADS_CLIENT_SECRET=votre_secret_client_google_ads
GOOGLE_ADS_DEVELOPER_TOKEN=votre_token_developpeur_google_ads
GOOGLE_ADS_CUSTOMER_ID=votre_id_client_google_ads
GOOGLE_ADS_REFRESH_TOKEN=votre_token_rafraichissement_google_ads
GOOGLE_ADS_CONVERSION_ACTION_ID=votre_id_action_conversion
GOOGLE_ADS_CONVERSION_LABEL=votre_etiquette_conversion

Assurez-vous de remplacer les valeurs par vos propres informations.

5. Démarrez le serveur :
npm start

L'application devrait maintenant être accessible à l'adresse `http://localhost:3000`.

## Structure du projet

- `server.js` : Point d'entrée de l'application
- `routes/` : Contient les définitions des routes de l'API
- `controllers/` : Logique de traitement des requêtes
- `models/` : Définitions des modèles de données Mongoose
- `public/` : Fichiers statiques (HTML, CSS, JS côté client)
- `services/` : Services externes (Amazon API, Google Ads API)

## Fonctionnalités principales

- Gestion des funnels de produits
- Suivi des clics et des conversions
- Intégration avec l'API Amazon et Google Ads
- Interface d'administration pour la gestion des produits et des règles

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Votre Nom - [@votre_twitter](https://twitter.com/votre_twitter) - email@example.com

Lien du projet : [https://github.com/ECOMSKY/AMZ-TRACKING](https://github.com/ECOMSKY/AMZ-TRACKING)
