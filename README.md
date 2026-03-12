<div align="center">
  <img src="https://ecodata.ecommaps.com/storage/v1/object/public/ecommaps%20eco/EcommapsLogoForLiteMode.png" alt="Ecommaps Logo" width="250" style="margin-bottom: 20px" />

  # 🚀 Ecommaps GenAI Starter

  Welcome to the **Ecommaps GenAI Starter**, the most advanced storefront template in the Ecommaps ecosystem. Designed as the perfect starting point for developers and merchants, this template is equipped with cutting-edge web and AI technologies to deliver an exceptional shopping experience. Built entirely on **Next.js 16+ (App Router)**, it provides a clean, professional, and endlessly customizable development environment.

  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://sdk.vercel.ai/docs"><img src="https://img.shields.io/badge/v0.1.1-000000?style=for-the-badge&logo=openai&label=AI_SALES_AGENT" alt="AI SDK" /></a>
  <a href="https://docs.ecommaps.com"><img src="https://img.shields.io/badge/Ecommaps-SDK-000?style=for-the-badge&logo=ecommaps" alt="Ecommaps SDK" /></a>
</div>

---

## ✨ Key Features

- **⚡ Blazing Fast Performance:** Built with **Next.js 16+** and **React 19**, relying on Server Components and Server Actions for maximum performance with **TailwindCSS v4**.
- **🧠 AI Sales Agent:** An interactive, conversational AI assistant integrated directly into the UI. It understands customer needs, recommends products, and modifies the cart in real-time.
- **🛍️ Localized for the Algerian Market:** Full Right-to-Left (RTL) Arabic support (as well as French/LTR), featuring a custom Cash on Delivery (COD) checkout flow that natively includes all Algerian Wilayas and Communes.
- **📦 Seamless SDK Integration:** The template is fully powered by official Ecommaps packages to manage store data without manual, unstructured `fetch` calls.
- **🎨 Premium UI (Glassmorphism):** Professional, ready-to-use UI components backed by sophisticated **Framer Motion** animations and a modern, glass-like aesthetic.

---

## 🏢 Ecommaps Platform & Merchant Setup

Before running the storefront, you need an active Ecommaps store and an API key. Ecommaps is a comprehensive e-commerce platform that allows you to manage products, inventory, collections, and integrations with local shipping providers (like Yalidine, ZR, etc.).

### How to Retrieve Your API Key

1. **Create an Account:** Go to [Ecommaps Signup](https://app.ecommaps.com/en/signup) to create your account, or [Login](https://app.ecommaps.com/en/login) if you already have one.
2. **Access the Dashboard:** Once logged in, navigate to the [Main Dashboard](https://app.ecommaps.com/en/dashboard).
3. **Create a Store:** If you don't have a store yet, head securely to the [Onboarding Page](https://app.ecommaps.com/en/dashboard/onboarding) to choose your store's name and subdomain.
4. **Generate the API Key:**
   - Go to your specific Store Dashboard (e.g., `https://app.ecommaps.com/en/dashboard/sites/your-store-name`).
   - Navigate to **Settings**.
   - Open the **Keys** section and generate a new Storefront API Key.
5. **Manage Your Business:** From your store dashboard, you can create products, organize collections, update inventory, write blog posts, and connect local shipping applications.

*For more information about our platform, visit [ecommaps.com](https://ecommaps.com/en) or check our [Documentation](https://docs.ecommaps.com). Need help? [Contact us](https://ecommaps.com/en/contact).*

---

## 🚀 Quick Start

Set up your local development environment and start building in 3 simple steps:

### 1. Environment Variables
Copy the `.env.example` file to `.env.local` and add your Ecommaps API keys:
```bash
cp .env.example .env.local
```
Fill in the essential values in `.env.local`:
```env
# Your store's API endpoint
NEXT_PUBLIC_ECOMMAPS_API_URL=https://api.ecommaps.com/api/v1/storefront
# Your unique Storefront API Key from the Ecommaps Dashboard
ECOMMAPS_API_KEY=your_store_api_key

# OpenAI Key for the AI Sales Agent
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

### 2. Installation
This project uses `pnpm`. Install all required dependencies:
```bash
pnpm install
```

### 3. Run Development Server
Start the local server:
```bash
pnpm dev
```
🎉 **Awesome!** Your store is now running locally. Open your browser and navigate to: [http://localhost:3003](http://localhost:3003).

---

## 📦 Official Ecommaps Packages

This starter template is beautifully orchestrated using our official Open-Source packages. Each package serves a specific role in our layered architecture:

| Component | Responsibility | NPM Package | GitHub Repository |
| :--- | :--- | :--- | :--- |
| **Core Client** | The core API SDK providing strictly-typed contracts for all storefront endpoints. | [@ecommaps/client](https://www.npmjs.com/package/@ecommaps/client) | [ecommaps-js-sdk](https://github.com/labobankcom/ecommaps-js-sdk) |
| **Storefront Kit** | Pure commerce logic utilities for variant resolution, cart normalization, and promotion status tracking. | [@ecommaps/storefront-kit](https://www.npmjs.com/package/@ecommaps/storefront-kit) | [ecommaps-storefront-kit](https://github.com/labobankcom/ecommaps-storefront-kit) |
| **AI Sales Agent** | The intelligent sales layer providing server agent runtime factories and interactive React chat UI components. | [@ecommaps/ai-sales-agent](https://www.npmjs.com/package/@ecommaps/ai-sales-agent) | [ecommaps-ai-sales-agent](https://github.com/labobankcom/ecommaps-ai-sales-agent) |

---

## 🗺️ Project Structure

The folder structure is designed to be intuitive and highly scalable:

```text
ecommaps-genAI-Starter/
├── src/
│   ├── app/                    # Next.js App Router and main pages
│   │   ├── (main)/             # Store pages (Home, Collections, Cart, Blog)
│   │   ├── (auth)/             # Login and Registration pages
│   │   ├── api/chat/           # AI Sales Agent backend API
│   │   └── actions/            # Reusable Server Actions
│   ├── components/             # UI Components
│   │   ├── ai/                 # AI Sales Agent components (AIAssistant, ReasoningBlock)
│   │   ├── commercn/           # Commerce components (Product cards, promo banners)
│   │   ├── cart/               # Shopping cart utilities
│   │   ├── layout/             # Header and Footer
│   │   └── ui/                 # Core design system components (shadcn/ui style)
│   └── lib/                    # Configuration and SDK clients initialization
└── public/                     # Static assets (Images, Icons)
```

---

## 📚 Advanced Documentation

To get the most out of this template and understand its internal mechanisms, please review the included documentation files:

- 📖 [**DEVELOPER.md**](./DEVELOPER.md) - Comprehensive developer guide (AI architecture, Server Actions usage).
- 🧩 [**STOREFRONT_KIT_GUIDE.md**](./STOREFRONT_KIT_GUIDE.md) - How to use the `@ecommaps/storefront-kit` package.
- 🔄 [**MIGRATION.md**](./MIGRATION.md) - Upgrade and migration guidelines from older templates.

---

> Built with pride and passion 🇩🇿 for the developer and merchant community in Algeria by the **Ecommaps** team.
