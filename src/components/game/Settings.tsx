import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Volume2, VolumeX } from "lucide-react";

export default function Settings() {
  const { setGamePhase } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-100 mb-8">
          Настройки
        </h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Игровые настройки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-green-400" />
                  )}
                  <span className="text-gray-300 font-medium">Звук</span>
                </div>
                <Switch 
                  checked={!isMuted} 
                  onCheckedChange={toggleMute}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-700">
                <div className="flex justify-between items-end">
                  <div className="text-gray-400 text-sm">
                    Студия Марка Минченко
                  </div>
                  <div className="text-gray-500 text-xs">
                    2.10
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            onClick={() => setGamePhase('menu')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            ← Назад в меню
          </Button>
        </div>
      </div>
    </div>
  );
}
