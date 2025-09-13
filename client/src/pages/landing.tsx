import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Wifi, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-6xl font-bold text-foreground">EcoTracker</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real-time environmental monitoring with ESP8266, machine learning predictions, 
            and comprehensive data analytics for a sustainable future.
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg" 
            className="text-lg px-8 py-4"
            data-testid="button-signin"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Wifi className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>IoT Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless ESP8266 integration with DHT11 and MQ135 sensors for real-time environmental monitoring.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Live Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interactive dashboards with real-time charts and comprehensive data visualization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">ML</span>
              </div>
              <CardTitle>AI Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Machine learning models for air quality forecasting and environmental trend analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent threshold monitoring with instant notifications for environmental changes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Hardware Setup Preview */}
        <div className="bg-card rounded-lg border border-border p-8 mb-16">
          <h2 className="text-3xl font-bold text-card-foreground mb-6 text-center">
            Easy Hardware Setup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Sensors</h3>
              <p className="text-muted-foreground text-sm">
                Wire DHT11 and MQ135 sensors to your ESP8266 following our detailed guide.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Code</h3>
              <p className="text-muted-foreground text-sm">
                Flash our Arduino code to establish WebSocket communication with the platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Monitor Live</h3>
              <p className="text-muted-foreground text-sm">
                View real-time data streams and AI-powered predictions in your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start Monitoring Your Environment Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the sustainable future with intelligent environmental monitoring.
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-4"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
