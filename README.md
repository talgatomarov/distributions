# Distribution Visualizer

A modern React application for visualizing probability distributions with interactive parameter controls. Supports both continuous and discrete distributions with appropriate visualizations.

## Features

- **38 Probability Distributions** - Complete PyMC distribution library including Normal, Beta, Gamma, Binomial, Poisson, and many more
- **Interactive Controls** - Real-time parameter adjustment with sliders and exact value inputs
- **Smart Visualization** - Automatic switching between line plots (continuous) and bar charts (discrete)
- **Mathematical Accuracy** - Proper PDF/PMF implementations with numerical stability
- **Responsive Design** - Works on all screen sizes with modern UI

## Live Demo

Visit the live application: **https://talgatomarov.github.io/distributions/**

## Technologies Used

- **React 18** - Component-based architecture
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **Plotly.js** - Interactive scientific plotting
- **GitHub Pages** - Static site hosting

## Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/talgatomarov/distributions.git
cd distributions
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite (154 tests)
- `npm run lint` - Run ESLint

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment (Recommended)

The project will automatically deploy to GitHub Pages when you push to the `main` branch.

**Setup Steps:**

1. **Fork or clone this repository** to your GitHub account

2. **Enable GitHub Pages in repository settings:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on the next push to `main`

3. **Your site will be available at:**
   ```
   https://yourusername.github.io/distributions/
   ```

### Manual Deployment

If you need to deploy manually:

1. **Build the project:**
```bash
npm run build
```

2. **Deploy the `dist` folder to GitHub Pages:**
   - You can use the `gh-pages` package or manually upload the `dist` folder

### Configuration Notes

- The project is configured with `base: '/distributions/'` in `vite.config.js` for GitHub Pages
- The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles automatic building and deployment
- All assets use absolute paths to work correctly with the GitHub Pages subdirectory structure

### Troubleshooting

If deployment fails:
- Check that GitHub Pages is enabled in repository settings
- Ensure the workflow has proper permissions (automatically configured in the workflow file)
- Verify that the `main` branch protection rules allow the workflow to run

## Project Structure

```
src/
├── components/          # React components
├── lib/                # Distribution logic and math utilities
├── hooks/              # Custom React hooks
├── test/               # Test files (154 tests)
└── assets/             # Static assets

public/
├── fonts/              # Self-hosted Inter font files
└── favicon.svg         # Custom normal distribution favicon
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

**Talgat Omarov**
- GitHub: [@talgatomarov](https://github.com/talgatomarov)
- Project: [Distribution Visualizer](https://github.com/talgatomarov/distributions)

---

*Built with React, Vite, and mathematical precision. Deployed with GitHub Pages.*