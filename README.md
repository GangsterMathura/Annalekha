# अन्नलेखा — GitHub Pages website

A static Hindi web application for household entitlement calculation, monthly grain-delivery records, official state/UT help routes and preparation of a formal Hindi representation.

## Files
- `index.html` — Hindi interface and page content
- `styles.css` — responsive visual design
- `app.js` — calculator, local ledger, state/UT directory and representation generator
- `SOURCES.md` — official reference pages and scope notes
- `LICENSE` — MIT License
- `.nojekyll` — GitHub Pages configuration

## Publish on GitHub Pages
1. Create a public repository named `annalekha`.
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select `main` and `/(root)`, then save.
6. GitHub Pages will publish the site after deployment completes.

No build step, server, database, API key or package installation is required.

## Features
- General entitlement baseline: 5 kg per eligible person/month for Priority Households; 35 kg per household/month for Antyodaya Anna Yojana households.
- Household member count and entitlement calculation.
- Monthly records stored in the visitor's browser.
- CSV export and print view.
- A directory selector for all 28 States and 8 Union Territories. Where a direct state/UT grievance route is not listed in the official NFSA directory, the app directs the visitor to the official directory rather than inventing a destination.
- District food and supply office directory.
- Hindi representation generator; generated text is not submitted automatically.

## Privacy and limitations
Ledger entries are stored in the visitor's browser using `localStorage`; the app does not send the entered personal details to a server. Clearing browser storage or changing devices may remove or separate records. Google Fonts is loaded from an external service for typography; remove the font links in `index.html` for a system-font-only version.

This is an independent public-interest tool, not a government service. It does not decide eligibility or file a formal grievance. State-specific entitlements, grain composition, prices, and procedures may differ and must be checked with the relevant State/UT department.

## Customisation
Edit the Hindi wording in `index.html`. Entitlement calculations and official directory links are in `app.js`. Styling tokens are at the top of `styles.css`.
