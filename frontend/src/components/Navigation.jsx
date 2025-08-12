import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Lightbulb, Calculator, TestTube } from 'lucide-react';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/STR_LABELAccueil', icon: Home }
    { path: '/dashboardSTR_LABELDashboard', icon: BarChart3 }
    { path: '/generatorSTR_LABELGénérateur', icon: Lightbulb }
    { path: '/calculatorSTR_LABELCalculateur', icon: Calculator }
    { path: '/testSTR_LABELTest', icon: TestTube }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HustleFinder IA
              </div>
            </Link>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;