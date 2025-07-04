# SolarMate - Smart Solar Sizing for Nigeria

A comprehensive solar system design calculator specifically tailored for the Nigerian market, providing accurate component sizing and system optimization for professional installation.

## 🚀 Features

- **Smart Component Sizing**: Automatic calculation of solar panels, inverters, batteries, and protection devices
- **Nigerian Market Focus**: Location-specific solar data and regional optimization
- **Interactive Maps**: Visual location selection with Nigerian cities
- **Professional Lead Generation**: Comprehensive audit services and installation support
- **Technical Specifications**: Detailed BOM and system performance analysis
- **Advanced Analytics**: Solar generation charts and battery performance metrics

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
2. **Build Settings**: Set build command to `npm run build`
3. **Publish Directory**: Set to `dist`
4. **Environment Variables**: Add your environment variables in Netlify dashboard

## 🎯 Key Features

### Solar System Design
- **Location-Based Calculations**: Uses PVGIS data for accurate solar potential
- **Appliance Load Profiling**: Detailed energy consumption analysis
- **Battery Optimization**: Smart battery selection with lithium preference
- **Component Matching**: Optimized inverter and panel selection
- **Protection Systems**: Proper breaker and surge protection sizing

### Professional Services
- **Site Survey**: Comprehensive location assessment
- **Electrical Analysis**: Load verification and compliance checks
- **Installation Planning**: Timeline and logistics coordination
- **Warranty Support**: 1-5 years on major components
- **Ongoing Maintenance**: Technical support and monitoring

### Technical Specifications
- **System Sizing**: 0.1-100 kWh daily energy range
- **Backup Duration**: 8-24 hours configurable
- **Component Limits**: Up to 12.6kWp system capacity
- **Efficiency Optimization**: 85% battery efficiency factor
- **Safety Margins**: 10% solar generation buffer

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
5. **Professional Audit**: Contact us for comprehensive site assessment

---

**Built with ❤️ for the Nigerian solar market**

**Developed by [@ibroraheem](https://x.com/ibroraheem)** 