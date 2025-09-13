import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Leaf, 
  BarChart3, 
  Cpu, 
  Brain, 
  Settings, 
  History,
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Sensors', href: '/sensors', icon: Cpu },
  { name: 'ML Predictions', href: '/predictions', icon: Brain },
  { name: 'Hardware Setup', href: '/hardware', icon: Settings },
  { name: 'Data History', href: '/history', icon: History },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return email?.split('@')[0] || 'User';
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Leaf className="h-8 w-8 mr-3" />
          EcoTracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Environmental Monitoring</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-card-foreground hover:bg-muted'
                }`}
                onClick={() => setLocation(item.href)}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-card-foreground" data-testid="text-username">
                {getDisplayName(user?.firstName, user?.lastName, user?.email)}
              </p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
