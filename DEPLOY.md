# Deploying the Courser Calculator

This site is a static page (`index.html` + `breeding-calculator.js`), served on
the existing Apache VPS at **https://ook.monster/courser-calc**.

Updating is automatic: every push to `main` triggers a GitHub Action that SSHes
into the VPS and fast-forwards a git clone to the latest commit. Do the one-time
setup below once, and after that you never touch the server — just push.

---

## One-time server setup

Run these on the VPS (as the user that should own the site files).

### 1. Clone the repo into the web tree

```bash
sudo mkdir -p /var/www/courser-calc
sudo chown "$USER":"$USER" /var/www/courser-calc
git clone https://github.com/ookpassant/courser-calculator.git /var/www/courser-calc
```

> If you put it somewhere other than `/var/www/courser-calc`, remember the path —
> you'll reuse it in the Apache config and the `VPS_DEPLOY_PATH` secret.

### 2. Wire up Apache

Copy the directives from [`deploy/courser-calc.apache.conf`](deploy/courser-calc.apache.conf)
into your existing `ook.monster` `<VirtualHost>` block (the `:443` HTTPS one),
then reload:

```bash
sudo apachectl configtest    # sanity check
sudo systemctl reload apache2   # or: sudo systemctl reload httpd
```

Apache must be allowed to read `/var/www/courser-calc`. If it's owned by your
user, the simplest route is to give the web group read access, e.g.:

```bash
sudo chgrp -R www-data /var/www/courser-calc   # 'apache' on RHEL-family
chmod -R g+rX /var/www/courser-calc
```

Visit https://ook.monster/courser-calc — you should see the calculator.

### 3. Create a deploy SSH key

On your laptop (or the VPS), generate a key dedicated to deploys:

```bash
ssh-keygen -t ed25519 -f courser-deploy -N "" -C "courser-calc deploy"
```

- Add the **public** half to the VPS user's authorized keys:
  ```bash
  cat courser-deploy.pub >> ~/.ssh/authorized_keys   # on the VPS, as the deploy user
  ```
- Keep the **private** half (`courser-deploy`) for the next step.

### 4. Add GitHub repository secrets

In the repo: **Settings -> Secrets and variables -> Actions -> New repository secret**.

| Secret             | Value                                              | Required |
|--------------------|----------------------------------------------------|----------|
| `VPS_HOST`         | `ook.monster` (or the server IP)                   | yes      |
| `VPS_USER`         | the SSH user that owns `/var/www/courser-calc`     | yes      |
| `VPS_SSH_KEY`      | contents of the **private** `courser-deploy` file  | yes      |
| `VPS_PORT`         | SSH port, if not `22`                              | no       |
| `VPS_DEPLOY_PATH`  | clone path, if not `/var/www/courser-calc`         | no       |

That's it. The workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
is already in the repo and will run on the next push to `main`.

---

## How updates flow after setup

```
git push  ->  main  ->  GitHub Action  ->  ssh into VPS  ->  git reset --hard origin/main
```

- The Action also runs on demand: **Actions tab -> Deploy to VPS -> Run workflow**.
- Manual fallback on the box: `cd /var/www/courser-calc && ./deploy/deploy.sh`
  (or `DEPLOY_PATH=/somewhere ./deploy.sh`).
- Deploys use `git reset --hard origin/main`, so the server tree always matches
  `main` exactly — never edit files directly on the server, your changes would
  be wiped on the next deploy.

## Notes

- The site is subpath-safe: assets are referenced relatively, so `/courser-calc`
  works without code changes. If you ever move it to its own subdomain, no edits
  are needed either.
- The Apache config blocks web access to the `.git` directory, so the repo
  metadata isn't exposed.
