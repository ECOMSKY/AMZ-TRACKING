const fs = require('fs');
const { exec } = require('child_process');

const addDomainToNginx = (domain) => {
  const nginxConfig = `
    server {
        listen 80;
        server_name ${domain};

        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Redirect HTTP to HTTPS
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 301 https://${domain}$request_uri;
        }
    }
  `;

  // Write the configuration file to Nginx sites-available directory
  const filePath = `/etc/nginx/sites-available/${domain}`;
  fs.writeFileSync(filePath, nginxConfig);

  // Create a symbolic link to sites-enabled
  exec(`ln -s /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/`, (err) => {
    if (err) {
      console.error(`Error creating symlink for ${domain}:`, err);
      return;
    }

    // Reload Nginx after the new domain config
    exec('nginx -t && systemctl reload nginx', (reloadErr) => {
      if (reloadErr) {
        console.error(`Error reloading Nginx after adding ${domain}:`, reloadErr);
      } else {
        console.log(`Domain ${domain} added and Nginx reloaded successfully.`);

        // Generate SSL using Certbot
        generateSSL(domain);
      }
    });
  });
};

const generateSSL = (domain) => {
  console.log(`Generating SSL certificate for ${domain}...`);

  exec(`sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m your-email@example.com`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error generating SSL certificate for ${domain}:`, stderr);
      return;
    }

    console.log(`SSL certificate generated for ${domain}:\n`, stdout);

    // Reload Nginx after installing the certificate
    exec('nginx -t && sudo systemctl reload nginx', (reloadErr) => {
      if (reloadErr) {
        console.error(`Error reloading Nginx after generating SSL for ${domain}:`, reloadErr);
      } else {
        console.log(`SSL for ${domain} is active and Nginx reloaded.`);
      }
    });
  });
};

module.exports = {
    addDomainToNginx,
}