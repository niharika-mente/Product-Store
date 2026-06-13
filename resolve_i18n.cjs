const fs = require('fs');

function processNavbar() {
    let content = fs.readFileSync('FRONTEND/src/components/ui/Navbar.jsx', 'utf8');
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';\nimport { LanguageSwitcher } from '../LanguageSwitcher.jsx';");
    content = content.replace("const Navbar = () => {", "const Navbar = () => {\n  const { t } = useTranslation();");
    content = content.replace('placeholder="Search products..."', "placeholder={t('common.search')}");
    content = content.replace('aria-label="Search products"', "aria-label={t('common.search')}");
    content = content.replace('aria-label="Create new product"', "aria-label={t('nav.addProduct')}");
    content = content.replace('aria-label="Open cart"', "aria-label={t('cart.openCart')}");
    content = content.replace('aria-label="Toggle color mode"', "aria-label={t('common.toggleTheme')}");
    content = content.replace('Shopping Cart</DrawerHeader>', "{t('cart.title')}</DrawerHeader>");
    content = content.replace('Your cart is empty.', "{t('cart.empty')}");
    content = content.replace('Qty:', "{t('cart.quantity')}:");
    content = content.replace('>Remove<', ">{t('cart.remove')}<");
    content = content.replace('Total Amount:', "{t('cart.total')}:");
    content = content.replace('>Proceed to Checkout<', ">{t('cart.checkout')}<");
    content = content.replace('</Button>\n              </Link>\n\n              <Link to={"/wishlist"}>', "</Button>\n              </Link>\n\n              <LanguageSwitcher />\n\n              <Link to={\"/wishlist\"}>");
    fs.writeFileSync('FRONTEND/src/components/ui/Navbar.jsx', content);
}

function processHomePage() {
    let content = fs.readFileSync('FRONTEND/src/pages/HomePage.jsx', 'utf8');
    content = content.replace("import { Link } from \"react-router-dom\";", "import { Link } from \"react-router-dom\";\nimport { useTranslation } from 'react-i18next';");
    content = content.replace("const HomePage = () => {", "const HomePage = () => {\n  const { t } = useTranslation();");
    content = content.replace('>Discover Amazing Products<', ">{t('products.title')}<");
    content = content.replace('>Browse and manage your product collection with ease.<', ">{t('products.subtitle')}<");
    content = content.replace('>No matching products<', ">{t('products.noProductsFound')}<");
    content = content.replace(">Try adjusting your search or filters to find what you're looking for.<", ">{t('products.noProductsFoundDesc')}<");
    content = content.replace('>No Products Yet<', ">{t('products.noProducts')}<");
    content = content.replace('>Start building your store by adding your first product.<', ">{t('products.noProductsDesc')}<");
    content = content.replace('>Create Product ✨<', ">{t('products.createProduct')} ✨<");
    fs.writeFileSync('FRONTEND/src/pages/HomePage.jsx', content);
}

function processCreatePage() {
    let content = fs.readFileSync('FRONTEND/src/pages/CreatePage.jsx', 'utf8');
    content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useTranslation } from 'react-i18next';");
    content = content.replace("const CreatePage = () => {", "const CreatePage = () => {\n  const { t } = useTranslation();");
    content = content.replace('>Create New Product<', ">{t('nav.createProduct')}<");
    content = content.replace('placeholder="Product Name"', "placeholder={t('products.name')}");
    content = content.replace('placeholder="Price"', "placeholder={t('products.price')}");
    content = content.replace('placeholder="Image URL"', "placeholder={t('products.imageUrl')}");
    content = content.replace('>Add Product<', ">{t('nav.addProduct')}<");
    fs.writeFileSync('FRONTEND/src/pages/CreatePage.jsx', content);
}

try {
    processNavbar();
    processHomePage();
    processCreatePage();
    console.log("Translations added.");
} catch (e) {
    console.error(e);
}
