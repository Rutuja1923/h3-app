# h3-app

A minimal backend setup to get familiar with the basics of the H3 framework.

## 🚀 What is H3?

H3 is a lightweight and modern web framework for building HTTP servers in Node.js. It provides simple routing, middleware, and handler tools similar to Express, but with a cleaner, modular design and better TypeScript support.

## 🛠️ Features

- Simple route handling
- Custom middleware
- TypeScript support
- Modular structure (routes & middleware)
- Live reload with `listhen`

## 📦 Installation & Usage

### 1. Clone the repo

```bash
git clone https://github.com/Rutuja1923/h3-app.git
cd h3-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the server (with live reload & browser open)

```bash
npx --yes listhen -w --open ./server.ts
```

> Make sure you have TypeScript configured correctly (`tsconfig.json` present).

## 🧪 Test

Visit:

- [http://localhost:3000/](http://localhost:3000/)
- [http://localhost:3000/hello](http://localhost:3000/hello)

You should see JSON responses from your H3 server. Similarly try other routes.

## 📚 Learning Reference

- H3 Documentation: [https://v1.h3.dev/guide](https://v1.h3.dev/guide)
