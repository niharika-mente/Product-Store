const { execSync } = require('child_process');
const fs = require('fs');

const features = [
    {
        title: "Feature: User Profile Management and Address Book",
        desc: "(Feature Request) Users currently have no way to save their shipping addresses or manage their profile details. They must re-enter information every time they checkout.",
        repro: "1. Go to checkout.\n2. Notice there is no option to select a saved address.\n3. Complete purchase, data is lost.",
        expected: "Users should have a 'My Profile' page where they can save default shipping/billing addresses and upload an avatar.",
        actual: "No user profile page or address book exists.",
        cause: "The backend User model (if it existed) lacks embedded Address schemas.",
        context: "Improves repeat customer experience."
    },
    {
        title: "Feature: Secure Password Reset Flow via Email",
        desc: "(Feature Request) Once authentication is implemented, users will inevitably forget their passwords. There is no password recovery mechanism.",
        repro: "1. Try to log in with a forgotten password.\n2. Look for a 'Forgot Password' link.\n3. Notice it doesn't exist.",
        expected: "A 'Forgot Password' button should trigger an email with a secure, expiring JWT link to reset the password.",
        actual: "Users are permanently locked out if they forget their password.",
        cause: "No Nodemailer integration or reset token logic in auth controllers.",
        context: "Standard security requirement."
    },
    {
        title: "Feature: Social OAuth Login (Google/GitHub)",
        desc: "(Feature Request) Forcing users to create a new account using email/password causes friction and drops conversion rates.",
        repro: "1. Go to the planned login page.\n2. Observe only Email/Password options.\n3. Users abandon the cart due to registration friction.",
        expected: "Users should be able to click 'Login with Google' or 'Login with GitHub' for 1-click registration.",
        actual: "Only local authentication is planned.",
        cause: "Passport.js OAuth2 strategies are not implemented in the backend.",
        context: "Greatly improves user acquisition."
    },
    {
        title: "Feature: Automated Order Confirmation Emails",
        desc: "(Feature Request) When a user completes a checkout, they receive no receipt or confirmation via email, leading to support queries.",
        repro: "1. Complete a checkout.\n2. Check your email inbox.\n3. Receive nothing.",
        expected: "The backend should dispatch an HTML email receipt containing the order total, items, and estimated shipping date.",
        actual: "The system is entirely silent after a successful checkout.",
        cause: "No email service (e.g., SendGrid, Nodemailer) is integrated into the checkout controller.",
        context: "Essential for professional e-commerce operations."
    },
    {
        title: "Feature: Multi-Currency Support (USD, EUR, INR)",
        desc: "(Feature Request) The store only displays prices in USD, alienating international customers who want to see local currency.",
        repro: "1. Visit the store from Europe.\n2. Observe all prices are hardcoded with a `$` symbol.\n3. Users have to manually convert prices.",
        expected: "A dropdown in the Navbar should allow users to switch between USD, EUR, INR, etc., recalculating prices based on live exchange rates.",
        actual: "Prices are strictly formatted as USD.",
        cause: "Frontend hardcodes the `$` symbol and uses raw database numeric values without a conversion multiplier.",
        context: "Increases international sales."
    },
    {
        title: "Feature: Multiple Images per Product (Carousel)",
        desc: "(Feature Request) The Product model only supports a single image URL. Users cannot view products from different angles.",
        repro: "1. Open a ProductPage.\n2. Try to view alternative images of the item.\n3. Observe only a single static image exists.",
        expected: "Product pages should feature an image carousel/gallery allowing users to swipe through 3-5 images.",
        actual: "Only one image is displayed.",
        cause: "The `Product` schema restricts `image` to a single String rather than an Array of Strings `[String]`.",
        context: "Better product visibility increases sales."
    },
    {
        title: "Feature: Stripe Payment Gateway Integration",
        desc: "(Feature Request) The current checkout simply mocks a successful payment. No actual money is processed.",
        repro: "1. Go to checkout.\n2. Click Proceed.\n3. Order succeeds without asking for credit card info.",
        expected: "The app should redirect to a Stripe Checkout session or use Stripe Elements to process real credit cards securely.",
        actual: "Checkout is completely simulated.",
        cause: "Stripe SDK is not installed and no PaymentIntent is generated on the backend.",
        context: "Required to actually make money."
    },
    {
        title: "Feature: Admin Analytics and Sales Dashboard",
        desc: "(Feature Request) Store owners have no visual way to see their monthly revenue, top-selling products, or user growth.",
        repro: "1. Log in as an admin.\n2. Try to find sales statistics.\n3. Notice there is only a grid of products.",
        expected: "An Admin Dashboard should display charts (e.g., Recharts) showing revenue over time and stock level warnings.",
        actual: "No analytics UI exists.",
        cause: "Backend lacks aggregation pipelines to sum up Order totals by month.",
        context: "Crucial for business management."
    },
    {
        title: "Feature: Promo Codes and Coupon System",
        desc: "(Feature Request) There is no way to run sales, holiday promotions, or offer influencer discount codes.",
        repro: "1. Add items to cart.\n2. Look for a 'Promo Code' input box.\n3. Notice it doesn't exist.",
        expected: "Users should be able to enter a code (e.g., 'SUMMER20') at checkout to receive a percentage or flat discount.",
        actual: "Checkout only charges the full calculated total.",
        cause: "No `Coupon` model exists to validate codes and apply discount multipliers in `checkout.controller.js`.",
        context: "Standard marketing tool."
    },
    {
        title: "Feature: AI-Powered 'Related Products' Recommendations",
        desc: "(Feature Request) The current 'Related Products' algorithm just does a basic text search on the product name, which is often inaccurate.",
        repro: "1. View a product named 'Apple'.\n2. Observe related products might just be anything with 'A' or 'p'.\n3. Recommendations are poor.",
        expected: "Related products should be based on categories, tags, or a vector similarity search for better accuracy.",
        actual: "Related products use a primitive regex split on the product name.",
        cause: "Complex recommendation logic is missing.",
        context: "Better recommendations drive higher cart values."
    },
    {
        title: "Feature: Review Ratings Histogram & Sorting",
        desc: "(Feature Request) Users can only see an average star rating. They cannot see the distribution of 5-star vs 1-star reviews.",
        repro: "1. Scroll to the reviews section of a product.\n2. Try to filter by '1 star only' to see negative feedback.\n3. Notice it's impossible.",
        expected: "A visual histogram should show the percentage of each star rating, with clickable filters to sort reviews.",
        actual: "Reviews are just a flat list sorted by date.",
        cause: "Frontend `ProductReviews.jsx` lacks aggregation UI and backend doesn't support rating filters.",
        context: "Enhances trust and transparency."
    },
    {
        title: "Feature: SEO Meta Tags for Product Sharing",
        desc: "(Feature Request) When users share a product link on Twitter or iMessage, no image or description appears in the preview card.",
        repro: "1. Copy a ProductPage URL.\n2. Paste it into Discord or Slack.\n3. Observe a generic, empty site preview.",
        expected: "The page should include dynamic OpenGraph and Twitter Card meta tags for the specific product.",
        actual: "React SPA uses a static `index.html` with no dynamic head tags.",
        cause: "React Helmet is not utilized to inject dynamic `<meta>` tags based on the fetched product.",
        context: "Critical for organic social media marketing."
    },
    {
        title: "Feature: 'Recently Viewed' History Drawer",
        desc: "(Feature Request) Customers often lose track of products they looked at 10 minutes ago and struggle to find them again.",
        repro: "1. Browse 5 different products.\n2. Try to return to the first one without using the browser back button.\n3. It's difficult.",
        expected: "A persistent 'Recently Viewed' section should appear at the bottom of the screen or in a side drawer.",
        actual: "No browsing history is kept.",
        cause: "The frontend does not track viewed `product._id`s in LocalStorage or Zustand state.",
        context: "Improves navigation and conversions."
    },
    {
        title: "Feature: Product Comparison Tool",
        desc: "(Feature Request) Users cannot compare the specs or prices of two similar products side-by-side.",
        repro: "1. Find two similar laptops.\n2. Attempt to compare their specs.\n3. Must open them in two separate browser tabs.",
        expected: "Users should be able to click 'Add to Compare' and view a side-by-side table of prices, brands, and ratings.",
        actual: "No comparison functionality exists.",
        cause: "Comparison state logic is missing from the frontend.",
        context: "Helps users make purchasing decisions faster."
    },
    {
        title: "Feature: 'Frequently Bought Together' Bundles",
        desc: "(Feature Request) The store misses out on cross-selling opportunities by not offering bundled product discounts.",
        repro: "1. View a laptop.\n2. Notice there is no prompt to also buy a mouse and keyboard as a bundle.\n3. Store loses potential revenue.",
        expected: "The product page should suggest 2-3 complementary items that can be added to the cart with one click.",
        actual: "Only generic 'Related Products' are shown.",
        cause: "Backend lacks mapping for complementary item associations.",
        context: "Directly increases Average Order Value (AOV)."
    },
    {
        title: "Feature: Live Chat Support Widget",
        desc: "(Feature Request) Customers with immediate questions about a product have no way to contact the store owner.",
        repro: "1. Have a question about a product's warranty.\n2. Look for a chat icon.\n3. Notice the site has no contact method.",
        expected: "A floating chat bubble in the bottom right corner should allow users to talk to support or an AI bot.",
        actual: "No real-time communication exists.",
        cause: "No third-party chat integration (e.g., Intercom, Tawk.to) in `App.jsx`.",
        context: "Improves customer trust and resolves purchasing blockers."
    },
    {
        title: "Feature: Newsletter Subscription Form",
        desc: "(Feature Request) The store has no mechanism to collect user emails for marketing and retargeting.",
        repro: "1. Scroll to the footer.\n2. Look for an email signup form.\n3. It is missing.",
        expected: "The footer should contain an input field to subscribe to the newsletter for a '10% off' welcome code.",
        actual: "Footer only contains static links.",
        cause: "No Mailchimp integration or `Newsletter` backend model.",
        context: "Vital for building a customer retention pipeline."
    },
    {
        title: "Feature: Guest Checkout vs Registered Checkout",
        desc: "(Feature Request) Once auth is added, forcing users to register before buying causes high cart abandonment.",
        repro: "1. Go to checkout.\n2. Forced to create an account.\n3. User leaves.",
        expected: "Users should have the option to 'Checkout as Guest' by only providing an email for the receipt.",
        actual: "Checkout logic does not distinguish between guest and authenticated flows.",
        cause: "Backend checkout controller needs to accept optional user IDs.",
        context: "Reduces friction for first-time buyers."
    },
    {
        title: "Feature: Multi-Language Support (i18n)",
        desc: "(Feature Request) The entire application is hardcoded in English, ignoring non-English speaking markets.",
        repro: "1. Try to switch the site language to Spanish.\n2. Look for a language toggle.\n3. Cannot find one.",
        expected: "A language dropdown should switch the UI text between English, Spanish, French, etc.",
        actual: "All strings are hardcoded in the JSX.",
        cause: "React-i18next or similar localization libraries are not implemented.",
        context: "Required for global scale."
    },
    {
        title: "Feature: Persistent Dark Mode Across Devices",
        desc: "(Feature Request) Dark mode preference is only saved in the local browser. If a user logs in on their phone, it resets.",
        repro: "1. Set site to Dark Mode on desktop.\n2. Log into the same account on mobile.\n3. Site is in Light Mode.",
        expected: "The user's theme preference should be saved to their database profile and synced across devices.",
        actual: "Chakra UI only saves preference in LocalStorage.",
        cause: "User model lacks a `themePreference` field.",
        context: "Provides a seamless cross-device experience."
    }
];

features.forEach((feat, index) => {
    const body = `
Describe the feature

${feat.desc}

Steps to Reproduce

${feat.repro}

Expected behavior

${feat.expected}

Actual behavior

${feat.actual}

Root Cause

${feat.cause}

Environment

Browser: Chrome 125, Firefox 126
Screen size: Desktop (1440px)

Additional context

${feat.context}
`;
    
    fs.writeFileSync(`temp_feat_${index}.txt`, body, 'utf8');
    try {
        console.log(`Creating issue ${index + 1}/20: ${feat.title}`);
        execSync(`gh issue create --title "${feat.title}" --body-file temp_feat_${index}.txt`);
    } catch(err) {
        console.error('Error creating issue', index, err.message);
    }
});

console.log("Finished creating 20 features.");
