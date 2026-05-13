# aguacatech.app

Marketing site for [Aguacatech](https://aguacatech.app), the Mac power tool that never phones home.

Static HTML/CSS/JS. No build step. Designed to be hosted on GitHub Pages.

## Local preview

Any static server works:

```sh
cd aguacatech-io
python3 -m http.server 4000
# or
npx serve .
```

Then open <http://localhost:4000>.

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `aguacatech/aguacatech.app` or `you/aguacatech-io`).
2. Copy the contents of this folder into the root of that repo.
3. Settings → Pages → Source: **Deploy from a branch** → `main` → `/ (root)`.
4. If you want the custom domain `aguacatech.app`, keep the `CNAME` file. Otherwise delete it.
5. DNS: point your domain's `A` records at the four GitHub Pages IPs (185.199.108–111.153) **or** a `CNAME` from `www` → `<user>.github.io`.

That's it. There's no Jekyll/Hugo/build pipeline. The `.nojekyll` file disables Jekyll processing so files starting with `_` (none, currently) ship verbatim.

## Structure

```
.
├── index.html              # Landing: hero, pillars, pricing, FAQ, footer
├── buy.html                # Tier cards with PayPal Smart Buttons
├── download.html           # DMG download + first-run instructions
├── success.html            # Post-payment thank-you (read by PayPal redirect)
├── privacy.html            # Privacy policy
├── 404.html                # Not found
├── CNAME                   # Custom domain (delete if not using one)
├── .nojekyll               # Disable Jekyll on GitHub Pages
├── robots.txt
├── sitemap.xml
├── README.md               # This file
└── assets/
    ├── css/styles.css      # Full design system + component styles
    ├── js/
    │   ├── main.js         # Nav, reveal-on-scroll, mobile menu
    │   └── paypal.js       # PayPal Smart Buttons config
    └── img/logo.svg        # Brand mark
```

## Going live with PayPal

The current build renders **PayPal Sandbox buttons** (client id `sb`). Clicking them does not move real money, they're for local testing.

To take real payments:

1. Sign in at <https://developer.paypal.com> and switch to **Live** mode.
2. Create a REST app and copy its **Client ID**.
3. In `buy.html`, replace `client-id=sb` in the PayPal SDK `<script>` tag with your real client id:

   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD&intent=capture"></script>
   ```

4. (Optional) Set up a [PayPal Webhook](https://developer.paypal.com/api/rest/webhooks/) for `PAYMENT.CAPTURE.COMPLETED` pointing at a small fulfillment endpoint (Cloudflare Worker, Vercel function, AWS Lambda, etc.) that generates a license key and emails it. Until that's wired up, fulfillment is manual: you receive PayPal's transaction email and reply to the buyer with a key. The site copy ("license key arrives within 24 hours") is honest under that flow.

### Yearly / subscription billing

The "yearly" toggle on each tier currently shows a hint to email support. To enable real recurring billing, create a [PayPal Subscription Plan](https://developer.paypal.com/docs/subscriptions/) per tier, then swap the `createOrder` call in `assets/js/paypal.js` for `createSubscription({ plan_id: '...' })`.

### Refund flow

14-day no-questions-asked refunds are stated on the buy page and in the privacy policy. Issue refunds from your PayPal merchant dashboard; no website code needed.

## Updating prices

Edit `assets/js/paypal.js`, `TIERS[tier].amount` is the dollar string PayPal uses for the order. Also update the visible price in `buy.html` and the pricing section of `index.html`.

## Updating the DMG link

`download.html` currently links to `https://github.com/aguacatech/aguacatech/releases/latest/download/Aguacatech.dmg`. Change that to wherever you actually publish the DMG (GitHub Releases is recommended, it gives you free hosting + automatic checksums + release notes).

## Design

- **Type:** Inter (loaded from rsms.me).
- **Palette:** dark `#07090a` base, green accent `#34c873`, tier colors purple `#7a78c8` (Sentinel) and orange `#e07534` (Power).
- **No frameworks.** Pure HTML/CSS/vanilla JS, keeps the site fast and the page-source readable.

## License

The marketing site is MIT licensed. The Aguacatech app itself is sold under its own EULA.
