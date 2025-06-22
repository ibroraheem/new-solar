# SolarMate - Smart Solar Sizing for Nigeria

A comprehensive solar system design calculator specifically tailored for the Nigerian market, providing accurate component sizing, pricing, and system optimization.

## 🚀 Features

- **Smart Component Sizing**: Automatic calculation of solar panels, inverters, batteries, and cables
- **Nigerian Market Focus**: Location-specific solar data and pricing
- **Interactive Maps**: Visual location selection with Nigerian cities
- **Real-time Pricing**: Up-to-date component pricing with 20% markup
- **PDF Reports**: Generate detailed system reports
- **Premium Features**: Advanced inverter selection, component comparison, and cost analysis

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Maps**: Leaflet + react-leaflet
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Deployment**: Netlify

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd new-solar

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Payment Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Application Configuration
URL=https://your-domain.netlify.app
ALLOWED_ORIGIN=https://your-domain.netlify.app

# PVGIS Configuration
PVGIS_TIMEOUT=30000
PVGIS_RETRY_ATTEMPTS=3

# Feature Flags
ENABLE_PREMIUM_FEATURES=true
ENABLE_PDF_GENERATION=true
ENABLE_COMPONENT_COMPARISON=true
```

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **Environment Variables**: Add all required environment variables in Netlify dashboard
4. **Deploy**: Netlify will automatically build and deploy your app

### Manual Deployment

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── input/          # Input forms and selectors
│   ├── output/         # Results and charts
│   ├── layout/         # Header, footer, navigation
│   └── ui/             # Reusable UI components
├── data/               # Static data and pricing
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.tsx           # Application entry point

netlify/
└── functions/         # Netlify serverless functions
```

## 🎯 Key Features

### Component Pricing
- **Inverters**: 2KVA to 10.2KVA with Growatt branding
- **Batteries**: 5KWH to 15.5KWH lithium batteries
- **Solar Panels**: 400W, 550W, and 600W options
- **Cables & Protection**: Complete wiring and protection devices

### Solar Data Integration
- **PVGIS API**: Real-time solar irradiance data
- **Location-based**: Nigerian cities with coordinates
- **Fallback Data**: Regional averages when API unavailable

### Payment Integration
- **Paystack**: Nigerian payment gateway
- **Premium Features**: ₦10,000 subscription
- **JWT Tokens**: Secure access management

## 🔒 Security

- **CORS Protection**: Environment-based origin validation
- **JWT Authentication**: Secure token-based access
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error management

## 📊 Performance

- **Code Splitting**: Automatic chunk optimization
- **Lazy Loading**: Component-based loading
- **Caching**: Efficient data caching strategies
- **Minification**: Production build optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🚀 Quick Start

1. **Select Location**: Choose your Nigerian city or use the map
2. **Add Appliances**: Select from presets or add custom appliances
3. **Set Backup Hours**: Choose how long you need backup power
4. **Get Results**: View your optimized solar system design
5. **Download Report**: Generate PDF report with full specifications

---

**Built with ❤️ for the Nigerian solar market** 