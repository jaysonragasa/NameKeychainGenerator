<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# KeychainLab3D

A powerful, interactive 3D web application designed for creating fully customizable name keychains ready for 3D printing.

## Background
Creating personalized keychains for 3D printing often requires navigating complex CAD software, which can be intimidating and time-consuming for hobbyists and beginners. **KeychainLab3D** bridges this gap by offering an intuitive, web-based interface that allows users to instantly generate 3D models of customized text keychains. Whether you're designing gifts, promotional items, or personal tags, KeychainLab3D streamlines the process from text input to a downloadable, print-ready 3D file.

## Features
- **Real-Time 3D Preview**: Watch your keychain take shape in a responsive 3D environment with lighting, shadows, and orbit controls.
- **Advanced Typography**: Support for multi-line text, alignment, bold, italic, and underline styling.
- **Custom Font Support**: Choose from a wide selection of Google Fonts or upload your own local `.ttf` font files. (Includes smart fallback to Helvetiker if the uploaded font is unavailable).
- **Customizable Base**: Opt for a contour-hugging base or a classic pill shape. Adjust corner radii, padding, and base thickness to your liking.
- **Integrated Keyring Loop**: Automatic generation of a sturdy attachment ring with customizable inner/outer radii and placement.
- **Export to 3D Print Formats**: Seamlessly export your creations as `.STL` or `.3MF` files, optimized and ready for your slicer software.
- **Dynamic Build Plate**: Toggle a visual build plate to understand the scale of your keychain before printing.

## Tech Stack
- **React.js**: Front-end library for building the dynamic user interface.
- **Three.js & React Three Fiber**: The core 3D engine and React wrapper powering the real-time visualization, text geometry generation, and rendering.
- **Clipper.js (clipper-lib)**: Robust 2D boolean operations library used to merge overlapping letter paths and generate the solid, printable base contours.
- **Tailwind CSS**: Utility-first CSS framework for a sleek, modern, and highly responsive dark-mode UI.
- **Vite**: Blazing fast front-end build tool and development server.
- **TypeScript**: Ensuring type safety, better developer experience, and maintainable code.
- **Lucide React**: Beautiful and consistent iconography.
- **3D Export Utilities**: Dedicated logic for generating standard 3D print formats (`exportSTL` and `export3MF`).

## Run Locally

**Prerequisites:** Node.js

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local server URL provided by Vite to start creating your keychains!
