# Electronix | Precision Electronic Components & Kits Web Platform

A production-grade, 100% static web application designed with the **IBM Carbon Design System** corporate color palette, engineered for deployment on **Netlify** with automated **CI/CD**, **Bunny.net CDN** asset pipeline, **Google Analytics 4**, **Microsoft Clarity**, and dedicated **WhatsApp rich social link preview cards** across all pages.

---

## 🚀 Live Architecture & Features

| Capability | Implementation Details |
| :--- | :--- |
| **Site Type** | 100% Static HTML5 / CSS3 / Vanilla JavaScript (zero server latency) |
| **Styling & Theme** | IBM Carbon Design System (IBM Blue `#0f62fe`, `#0043ce`, `#161616`, IBM Plex Sans/Mono) |
| **Hosting** | Netlify Edge with automated SSL/TLS & atomic cache management |
| **CI/CD** | Netlify Git Push Auto-Build + GitHub Actions Workflow (`.github/workflows/deploy.yml`) |
| **Forms & Email** | Netlify Forms (`data-netlify="true"`) with honeypot spam filter and automatic email routing |
| **CDN Integration** | Bunny.net Pull Zone configuration via `js/cdn-config.js` |
| **Analytics & UX** | Google Analytics 4 (`gtag.js`) + Microsoft Clarity session heatmaps |
| **Social / WhatsApp** | Full OpenGraph tags (`og:title`, `og:image`, `og:description`, `link rel="image_src"`) on every page |
| **Legal Disclaimers** | Complete 9-point technical safety, ESD S20.20, and soldered silicon warranty policy |

---

## 📂 Directory Structure

```text
electronics-store/
├── index.html                  # Homepage (Hero, featured components, engineering stats)
├── catalog.html                # Product & kit directory with live category filters & search
├── product-detail.html         # In-depth component spec sheet (ESP32-S3 Pro Dev Board)
├── about.html                  # Quality assurance, metrology lab & inspection standards
├── contact.html                # Netlify RFQ form (with email forwarding)
├── disclaimers.html            # Detailed technical, ESD, hazmat, battery & warranty disclaimers
├── css/
│   ├── ibm-carbon.css          # IBM Carbon color tokens, typography & base design rules
│   └── main.css                # Component cards, responsive layout, filters, modals & footer
├── js/
│   ├── cdn-config.js           # Bunny.net CDN configuration & fallback image engine
│   ├── analytics.js            # Google Analytics 4 & Microsoft Clarity initialization
│   └── main.js                 # Mobile menu, live search, WhatsApp generator & Netlify AJAX
├── netlify.toml                # Netlify build, security CSP headers, caching & form rules
├── .github/workflows/
│   └── deploy.yml              # CI/CD pipeline for GitHub Actions to Netlify
└── README.md                   # Documentation & configuration guide
```

---

## ⚙️ Configuration Guide

### 1. Bunny.net CDN Setup
1. Create a **Pull Zone** in your [Bunny.net Dashboard](https://panel.bunny.net/).
2. Point your Bunny Pull Zone origin URL to your Netlify website URL (e.g., `https://your-site.netlify.app`).
3. Open `js/cdn-config.js` and update `pullZoneUrl`:
   ```javascript
   pullZoneUrl: 'https://your-pullzone-name.b-cdn.net'
   ```
4. All images using `data-bunny-src="/products/..."` will automatically stream from your Bunny edge cache.

### 2. Netlify Forms & Automatic Email Notifications
Netlify detects `<form data-netlify="true" name="contact">` automatically on every deploy:
1. Push this project to GitHub/GitLab and link it to Netlify.
2. In the **Netlify Dashboard**, navigate to **Site configuration** &rarr; **Forms**.
3. Under **Form notifications**, click **Add notification** &rarr; **Email notification**.
4. Set:
   - **Form name**: `contact`
   - **Email address**: your corporate inbox (e.g., `sales@yourcompany.com` or `rfq@yourdomain.com`).
5. Every time a customer or engineer submits the RFQ form on `contact.html`, an email with all submission details (part SKU, quantity, message) will be delivered to your inbox instantly.

### 3. Google Analytics 4 & Microsoft Clarity Setup
Open `js/analytics.js` and enter your measurement IDs:
```javascript
const ANALYTICS_CONFIG = {
  gaMeasurementId: 'G-XXXXXXXXXX',     // Replace with your GA4 Measurement ID
  clarityProjectId: 'abcdef1234',      // Replace with your Clarity Project ID
  enabled: true
};
```

### 4. WhatsApp & Social Sharing Previews
Each page contains exact OpenGraph specifications:
- `og:title` & `og:description`
- `og:image` (1200x630px high-contrast landscape format required by WhatsApp)
- `og:image:width`, `og:image:height`, and `og:image:type`
- `<link rel="image_src" ...>`

To test before sharing:
1. Paste your deployed Netlify URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or send a link to any WhatsApp chat.
2. The image preview, title, and description will render immediately.

---

## 🚢 CI/CD Deployment Options

### Option A: Netlify Git Continuous Deployment (Recommended)
1. Push this repository to GitHub.
2. In Netlify, click **"Add new site"** &rarr; **"Import an existing project"** &rarr; Select your repository.
3. Build command: leave blank (static site).
4. Publish directory: `.` (root).
5. Click **Deploy Site**. Every `git push` to `main` will trigger an automated build and deploy.

### Option B: GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
If you prefer running deployment via GitHub Actions:
1. Go to your GitHub Repository **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Add:
   - `NETLIFY_AUTH_TOKEN`: Your Personal Access Token from Netlify User Settings.
   - `NETLIFY_SITE_ID`: Your Site ID from Netlify Site Configuration.
3. On every push to `main`, GitHub Actions will validate the static assets and deploy directly.

---

## 🧪 Local Testing
You can preview the website locally using any standard static file server:
```bash
# Using Python 3 built-in server:
python3 -m http.server 8080

# Or using npx serve:
npx serve .
```
Navigate to `http://localhost:8080` to test the catalog search, responsive layout, and form validation.
