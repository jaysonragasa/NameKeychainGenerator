# KeychainLab3D 🔑

![License: GNU GPLv3](https://img.shields.io/badge/License-GNU%20GPLv3-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

**KeychainLab3D** is a powerful, interactive 3D web application designed for creating fully customizable name keychains ready for 3D printing. Stop wrestling with complicated CAD software—just type, customize, and export!

---

## 📖 Background

Creating personalized keychains for 3D printing often requires navigating complex parametric modeling software. This can be an intimidating and time-consuming barrier for hobbyists, educators, and beginners. 

**KeychainLab3D** bridges this gap by offering an intuitive, web-based interface that allows users to instantly generate 3D models of customized text keychains. Whether you're designing gifts, promotional items, or personal tags, KeychainLab3D streamlines the entire process from text input directly to a downloadable, print-ready `.STL` or `.3MF` file.

## ✨ Features

- **Real-Time 3D Preview**: Watch your keychain take shape instantly in a responsive 3D environment complete with dynamic lighting, realistic shadows, and full orbit controls.
- **Advanced Typography**: Type multi-line text, adjust alignment, and apply formatting like bold, italic, and underline styling.
- **Custom Font Support**: Choose from a curated selection of Google Fonts (like Pacifico, Roboto, and Caveat) or upload your own local `.ttf` font files.
  - *Includes a smart fallback to standard fonts if your uploaded font is unavailable.*
- **Customizable Base**: 
  - **Contour Mode**: The base perfectly hugs the outline of your letters.
  - **Pill Mode**: A classic, rounded rectangular bounding box.
  - Fine-tune corner radii, contour padding, and base thickness to your exact liking.
- **Integrated Keyring Loop**: Automatically generates a sturdy attachment ring. You can customize its inner/outer radius and slide its position around the keychain.
- **Export to 3D Print Formats**: Seamlessly export your creations directly to `.STL` or `.3MF` formats. The exported models are perfectly manifold, boolean-merged, and optimized for immediate slicing.
- **Dynamic Build Plate**: Toggle a visual build plate and grid to understand the true physical scale of your keychain before you hit print.

## 🛠️ Tech Stack

KeychainLab3D is built with modern, cutting-edge web technologies:

- **Frontend**: [React.js](https://reactjs.org/)
- **3D Engine**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Geometry Operations**: `clipper-lib` (Robust 2D boolean operations for generating solid base contours and merging overlapping paths)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive dark-mode UI
- **Build Tool**: [Vite](https://vitejs.dev/) for lightning-fast development
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type-safe, maintainable code
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Quick Start (Run Locally)

Want to run KeychainLab3D on your own machine? It's easy!

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jaysonragasa/NameKeychainGenerator.git
   cd NameKeychainGenerator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to the local server URL provided by Vite (usually `http://localhost:5173`) to start designing!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/jaysonragasa/NameKeychainGenerator/issues). If you'd like to contribute code, please fork the repository and create a pull request.

## 📄 License

This project is protected under the **GNU General Public License v3.0**. See the [LICENSE.md](LICENSE.md) file for more details.
