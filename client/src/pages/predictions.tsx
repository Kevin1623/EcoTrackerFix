import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Download } from "lucide-react";
import { PredictionCharts } from "@/components/ml/prediction-charts";
import { useSensorData } from "@/hooks/useSensorData";

export default function Predictions() {
  const { devices } = useSensorData();
  const deviceId = devices?.[0]?.id;

  const { data: airQualityPredictions } = useQuery({
    queryKey: ['/api/predictions', deviceId, 'air_quality'],
    enabled: !!deviceId,
  });

  const modelPerformance = {
    accuracy: 87.5,
    precision: 84.2,
    recall: 89.1,
    lastTrained: '2 days ago',
    trainingSamples: 10450,
  };

  const featureImportance = [
    { feature: 'Temperature', importance: 0.35 },
    { feature: 'Humidity', importance: 0.28 },
    { feature: 'Time of Day', importance: 0.18 },
    { feature: 'Day of Week', importance: 0.12 },
    { feature: 'Trend', importance: 0.07 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">ML Predictions</h2>
          <p className="text-muted-foreground text-sm">Machine learning forecasts and analysis</p>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Air Quality Prediction */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Air Quality Forecast</CardTitle>
                <Badge>Next 24h</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <PredictionCharts deviceId={deviceId} predictions={airQualityPredictions} />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                  <p className="text-sm text-muted-foreground">6h average</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">Moderate</p>
                  <p className="text-sm text-muted-foreground">12h average</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                  <p className="text-sm text-muted-foreground">24h average</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="text-card-foreground font-medium">{modelPerformance.accuracy}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${modelPerformance.accuracy}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Precision</span>
                    <span className="text-card-foreground font-medium">{modelPerformance.precision}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${modelPerformance.precision}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Recall</span>
                    <span className="text-card-foreground font-medium">{modelPerformance.recall}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${modelPerformance.recall}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">Last trained: {modelPerformance.lastTrained}</p>
                  <p className="text-sm text-muted-foreground">Training data: {modelPerformance.trainingSamples.toLocaleString()} samples</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feature Importance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureImportance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-card-foreground font-medium">{item.feature}</span>
                  <div className="flex items-center space-x-3 flex-1 max-w-xs">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${item.importance * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {(item.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select defaultValue="random-forest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random-forest">Random Forest</SelectItem>
                      <SelectItem value="linear-regression">Linear Regression</SelectItem>
                      <SelectItem value="neural-network">Neural Network</SelectItem>
                      <SelectItem value="svm">SVM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="training-window">Training Window (hours)</Label>
                  <Input
                    id="training-window"
                    type="number"
                    defaultValue="168"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prediction-horizon">Prediction Horizon (hours)</Label>
                  <Input
                    id="prediction-horizon"
                    type="number"
                    defaultValue="24"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button className="flex-1" data-testid="button-retrain-model">
                    <Play className="h-4 w-4 mr-2" />
                    Retrain Model
                  </Button>
                  <Button variant="secondary" className="flex-1" data-testid="button-export-model">
                    <Download className="h-4 w-4 mr-2" />
                    Export Model
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
