import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, LogIn, Shield, User, Factory, ArrowRight, Sparkles } from 'lucide-react';
import icon1 from "@/images/icon1.png";
import icon2 from "@/images/icon2.png";
import icon3 from "@/images/icon3.png";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful! Welcome back to AndE Mamma.');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 p-4 md:p-8 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-300/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
        
        {/* Left Side - Enhanced Branding */}
        <div className="text-center lg:text-left space-y-8 md:space-y-12 px-4 md:px-8">
          {/* Enhanced Logo Section */}
          <div className="flex flex-col items-center lg:items-start space-y-6">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <img 
                  src={icon1} 
                  alt="AndE Mamma Logo" 
                  className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-900 to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
                  AndE Mamma
                </h1>
                <p className="text-lg md:text-xl text-green-700/90 font-light mt-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Manufacturing PLC
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Welcome Message */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Your Digital Hub
                </span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-4"></div>
            </div>
            <p className="text-lg md:text-xl text-green-700/90 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Streamline your production process with our intelligent manufacturing management platform.
            </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-lg mx-auto lg:mx-0">
            {[
              { icon: Factory, label: 'Production Tracking', color: 'emerald' },
              { icon: Shield, label: 'Secure Access', color: 'green' },
              { icon: User, label: 'Team Management', color: 'teal' },
              { icon: ArrowRight, label: 'Real-time Data', color: 'emerald' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/80 transition-all duration-300 group hover:scale-105 hover:shadow-lg"
              >
                <div className={`p-2 rounded-lg bg-${feature.color}-100 group-hover:bg-${feature.color}-200 transition-colors`}>
                  <feature.icon className={`h-5 w-5 text-${feature.color}-600`} />
                </div>
                <span className="text-green-900 font-medium text-sm md:text-base">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl border-0 overflow-hidden backdrop-blur-md bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02] relative group">
            {/* Enhanced Gradient Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 md:p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"></div>
              
              {/* Animated Orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-1000 delay-200"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center gap-4 relative">
                    <div className="relative">
                      <img 
                        src={icon3}
                        alt="Secure Login" 
                        className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg"
                      />
                      <div className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-lg"></div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                    Secure Login
                  </CardTitle>
                  <CardDescription className="text-green-100/90 text-lg font-light">
                    Access Your Manufacturing Dashboard
                  </CardDescription>
                </div>
              </div>
            </div>
            
            {/* Enhanced Card Content */}
            <CardContent className="p-6 md:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Enhanced Email Field */}
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-base md:text-lg font-semibold flex items-center gap-3 text-green-900">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                    </div>
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@andemamma.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 md:h-16 text-lg md:text-xl px-6 rounded-xl border-2 border-green-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 transition-all duration-300 shadow-sm group-hover:border-green-300"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Enhanced Password Field */}
                <div className="space-y-4">
                  <Label htmlFor="password" className="text-base md:text-lg font-semibold flex items-center gap-3 text-green-900">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                    </div>
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 md:h-16 text-lg md:text-xl px-6 pr-14 rounded-xl border-2 border-green-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 transition-all duration-300 shadow-sm group-hover:border-green-300"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-all duration-300 p-2 rounded-lg bg-white/80 hover:bg-white hover:shadow-md"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <Eye className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-lg md:text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                  disabled={isLoading}
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 md:h-6 md:w-6 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                      Access Manufacturing Dashboard
                    </>
                  )}
                </Button>
              </form>
              
              {/* Enhanced Additional Info */}
              <div className="mt-8 md:mt-10 text-center">
                <div className="bg-gradient-to-r from-transparent via-green-200 to-transparent h-px w-full mb-6"></div>
                <div className="flex items-center justify-center gap-3 text-green-700/90">
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Enterprise Security</span>
                  </div>
                  <span className="text-xs text-green-600/70">•</span>
                  <span className="text-sm text-green-600/80">v3.0 Production Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-center z-10 w-full px-4">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl py-3 px-8 inline-block border border-white/20">
          <p className="text-green-800/90 text-sm md:text-base font-medium">
            © {new Date().getFullYear()} AndE Mamma Manufacturing PLC
          </p>
          <p className="text-green-700/70 text-xs md:text-sm mt-1">
            Intelligent Manufacturing Platform • Secure Access Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;