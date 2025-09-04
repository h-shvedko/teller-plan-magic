import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  CheckCircle,
  Clock,
  ChefHat,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Recipe } from '@/lib/types';

interface VoiceActivatedCookingProps {
  recipe?: Recipe;
  onStepComplete?: (stepIndex: number) => void;
  onTimerStart?: (duration: number, stepName: string) => void;
}

interface VoiceSettings {
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  voice: string;
  autoAdvance: boolean;
  confirmCommands: boolean;
}

interface CookingStep {
  id: string;
  instruction: string;
  duration?: number; // in minutes
  temperature?: string;
  equipment?: string[];
  ingredients?: string[];
  isCompleted: boolean;
  notes?: string;
}

export const VoiceActivatedCooking: React.FC<VoiceActivatedCookingProps> = ({
  recipe,
  onStepComplete,
  onTimerStart,
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<CookingStep[]>([]);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  
  // Voice settings
  const [settings, setSettings] = useState<VoiceSettings>({
    speechRate: 0.9,
    speechPitch: 1.0,
    speechVolume: 0.8,
    voice: '',
    autoAdvance: true,
    confirmCommands: true,
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const availableVoices = useRef<SpeechSynthesisVoice[]>([]);

  // Voice commands mapping
  const commands = {
    navigation: {
      'next step': () => nextStep(),
      'previous step': () => previousStep(),
      'go to step': (stepNumber: number) => goToStep(stepNumber - 1),
      'repeat step': () => speakCurrentStep(),
      'start over': () => setCurrentStepIndex(0),
    },
    control: {
      'start timer': () => startStepTimer(),
      'pause': () => pauseSpeech(),
      'resume': () => resumeSpeech(),
      'stop': () => stopSpeech(),
      'complete step': () => markStepComplete(),
      'help': () => showVoiceCommands(),
    },
    information: {
      'what ingredients': () => speakIngredients(),
      'what equipment': () => speakEquipment(),
      'how long': () => speakDuration(),
      'what temperature': () => speakTemperature(),
    },
  };

  useEffect(() => {
    initializeVoiceCapabilities();
    initializeSteps();
    
    return () => {
      cleanup();
    };
  }, [recipe]);

  useEffect(() => {
    if (recognitionSupported) {
      setupSpeechRecognition();
    }
  }, [settings]);

  const initializeVoiceCapabilities = () => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecognitionSupported(!!SpeechRecognition);

    // Check for speech synthesis support
    setSpeechSupported('speechSynthesis' in window);
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        availableVoices.current = synthRef.current!.getVoices();
        if (availableVoices.current.length > 0 && !settings.voice) {
          // Set default voice (prefer English voices)
          const englishVoice = availableVoices.current.find(voice => 
            voice.lang.startsWith('en')
          );
          setSettings(prev => ({
            ...prev,
            voice: englishVoice?.name || availableVoices.current[0].name,
          }));
        }
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
  };

  const initializeSteps = () => {
    if (recipe?.instructions) {
      const cookingSteps: CookingStep[] = recipe.instructions.map((instruction, index) => ({
        id: `step-${index}`,
        instruction,
        duration: extractDuration(instruction),
        temperature: extractTemperature(instruction),
        equipment: extractEquipment(instruction),
        ingredients: extractIngredients(instruction, recipe.ingredients),
        isCompleted: false,
      }));
      setSteps(cookingSteps);
    } else {
      // Demo steps if no recipe provided
      setSteps([
        {
          id: 'demo-1',
          instruction: 'Preheat oven to 350°F and gather all ingredients',
          duration: 5,
          temperature: '350°F',
          equipment: ['oven', 'mixing bowl'],
          ingredients: ['flour', 'eggs', 'butter'],
          isCompleted: false,
        },
        {
          id: 'demo-2',
          instruction: 'Mix dry ingredients in a large bowl',
          duration: 3,
          equipment: ['large bowl', 'whisk'],
          isCompleted: false,
        },
      ]);
    }
  };

  const setupSpeechRecognition = () => {
    if (!recognitionSupported) return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        const confidence = lastResult[0].confidence;
        
        setLastCommand(transcript);
        setConfidence(confidence);
        
        processVoiceCommand(transcript, confidence);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const processVoiceCommand = (transcript: string, confidence: number) => {
    if (confidence < 0.7) return; // Ignore low-confidence commands

    const command = transcript.toLowerCase();
    
    // Check navigation commands
    if (command.includes('next')) {
      executeCommand(() => nextStep(), 'Moving to next step');
    } else if (command.includes('previous') || command.includes('back')) {
      executeCommand(() => previousStep(), 'Going to previous step');
    } else if (command.includes('repeat')) {
      executeCommand(() => speakCurrentStep(), 'Repeating current step');
    } else if (command.includes('complete') || command.includes('done')) {
      executeCommand(() => markStepComplete(), 'Step marked as complete');
    } else if (command.includes('timer') || command.includes('time')) {
      executeCommand(() => startStepTimer(), 'Starting timer');
    } else if (command.includes('ingredients')) {
      executeCommand(() => speakIngredients(), '');
    } else if (command.includes('equipment')) {
      executeCommand(() => speakEquipment(), '');
    } else if (command.includes('help')) {
      executeCommand(() => showVoiceCommands(), '');
    } else if (command.includes('pause')) {
      executeCommand(() => pauseSpeech(), 'Paused');
    } else if (command.includes('resume')) {
      executeCommand(() => resumeSpeech(), 'Resumed');
    }
    
    // Check for step number commands
    const stepMatch = command.match(/(?:go to |step |number )(\d+)/);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]);
      executeCommand(() => goToStep(stepNumber - 1), `Going to step ${stepNumber}`);
    }
  };

  const executeCommand = (commandFn: () => void, confirmationText: string) => {
    if (settings.confirmCommands && confirmationText) {
      speak(confirmationText, false);
    }
    commandFn();
  };

  const speak = (text: string, interrupt = true) => {
    if (!speechSupported || !synthRef.current) return;

    if (interrupt) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;
    utterance.volume = settings.speechVolume;
    
    // Set voice
    if (settings.voice && availableVoices.current.length > 0) {
      const selectedVoice = availableVoices.current.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakCurrentStep = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      let text = `Step ${currentStepIndex + 1}: ${currentStep.instruction}`;
      
      if (currentStep.duration) {
        text += ` This step takes about ${currentStep.duration} minutes.`;
      }
      
      if (currentStep.temperature) {
        text += ` Temperature: ${currentStep.temperature}.`;
      }
      
      speak(text);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      
      if (settings.autoAdvance) {
        setTimeout(() => speakCurrentStep(), 500);
      }
    } else {
      speak('You have completed all steps. Great job!');
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      
      if (settings.autoAdvance) {
        setTimeout(() => speakCurrentStep(), 500);
      }
    } else {
      speak('You are already at the first step');
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      
      if (settings.autoAdvance) {
        setTimeout(() => speakCurrentStep(), 500);
      }
    }
  };

  const markStepComplete = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].isCompleted = true;
    setSteps(updatedSteps);
    
    if (onStepComplete) {
      onStepComplete(currentStepIndex);
    }
    
    speak('Step completed!', false);
    
    // Auto-advance to next step
    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        nextStep();
      } else {
        speak('Congratulations! You have completed all cooking steps.');
      }
    }, 1000);
  };

  const startStepTimer = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.duration && onTimerStart) {
      onTimerStart(currentStep.duration, currentStep.instruction);
      speak(`Timer started for ${currentStep.duration} minutes`);
    } else {
      speak('No timer duration available for this step');
    }
  };

  const speakIngredients = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.ingredients && currentStep.ingredients.length > 0) {
      const text = `Ingredients for this step: ${currentStep.ingredients.join(', ')}`;
      speak(text);
    } else if (recipe?.ingredients) {
      const text = `All ingredients: ${recipe.ingredients.join(', ')}`;
      speak(text);
    } else {
      speak('No ingredients information available');
    }
  };

  const speakEquipment = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.equipment && currentStep.equipment.length > 0) {
      const text = `Equipment needed: ${currentStep.equipment.join(', ')}`;
      speak(text);
    } else {
      speak('No specific equipment mentioned for this step');
    }
  };

  const speakDuration = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.duration) {
      speak(`This step takes approximately ${currentStep.duration} minutes`);
    } else {
      speak('No specific duration mentioned for this step');
    }
  };

  const speakTemperature = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.temperature) {
      speak(`Temperature for this step: ${currentStep.temperature}`);
    } else {
      speak('No specific temperature mentioned for this step');
    }
  };

  const pauseSpeech = () => {
    if (synthRef.current) {
      synthRef.current.pause();
    }
  };

  const resumeSpeech = () => {
    if (synthRef.current) {
      synthRef.current.resume();
    }
  };

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const showVoiceCommands = () => {
    setShowCommands(true);
    speak('Voice commands panel opened');
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Helper functions for parsing instructions
  const extractDuration = (instruction: string): number | undefined => {
    const timeMatch = instruction.match(/(\d+)(?:\s*to\s*\d+)?\s*(?:minutes?|mins?|hours?|hrs?)/i);
    if (timeMatch) {
      const duration = parseInt(timeMatch[1]);
      return instruction.toLowerCase().includes('hour') ? duration * 60 : duration;
    }
    return undefined;
  };

  const extractTemperature = (instruction: string): string | undefined => {
    const tempMatch = instruction.match(/(\d+)°?\s*[fFcC]/);
    return tempMatch ? tempMatch[0] : undefined;
  };

  const extractEquipment = (instruction: string): string[] => {
    const equipment = [];
    const equipmentKeywords = [
      'bowl', 'pan', 'pot', 'oven', 'microwave', 'mixer', 'whisk',
      'spatula', 'knife', 'cutting board', 'measuring cup', 'spoon'
    ];
    
    equipmentKeywords.forEach(item => {
      if (instruction.toLowerCase().includes(item)) {
        equipment.push(item);
      }
    });
    
    return equipment;
  };

  const extractIngredients = (instruction: string, allIngredients: string[]): string[] => {
    const mentioned = [];
    for (const ingredient of allIngredients) {
      if (instruction.toLowerCase().includes(ingredient.toLowerCase())) {
        mentioned.push(ingredient);
      }
    }
    return mentioned;
  };

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="w-6 h-6" />
          Voice-Activated Cooking
        </h2>
        
        <div className="flex items-center gap-2">
          <Dialog open={showCommands} onOpenChange={setShowCommands}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Commands
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Voice Commands</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Navigation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>"Next step" - Move to next cooking step</li>
                    <li>"Previous step" - Go back to previous step</li>
                    <li>"Go to step 3" - Jump to a specific step number</li>
                    <li>"Repeat step" - Repeat current step instruction</li>
                    <li>"Start over" - Go back to first step</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Control</h4>
                  <ul className="space-y-1 text-sm">
                    <li>"Complete step" - Mark current step as done</li>
                    <li>"Start timer" - Start timer for current step</li>
                    <li>"Pause" / "Resume" - Control speech playback</li>
                    <li>"Stop" - Stop all speech</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Information</h4>
                  <ul className="space-y-1 text-sm">
                    <li>"What ingredients" - List ingredients for step</li>
                    <li>"What equipment" - List equipment needed</li>
                    <li>"How long" - Get step duration</li>
                    <li>"What temperature" - Get temperature info</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voice Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Voice</Label>
                  <Select
                    value={settings.voice}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.current.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Speech Rate: {settings.speechRate}</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Volume: {settings.speechVolume}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.speechVolume}
                    onChange={(e) => setSettings(prev => ({ ...prev, speechVolume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Capability Check */}
      {(!recognitionSupported || !speechSupported) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!recognitionSupported && 'Speech recognition is not supported in your browser. '}
            {!speechSupported && 'Speech synthesis is not supported in your browser. '}
            Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Button
                onClick={toggleListening}
                className={`w-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={!recognitionSupported}
              >
                {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </Button>
              
              {isListening && (
                <div className="text-center">
                  <Badge variant="destructive">Listening...</Badge>
                  {lastCommand && (
                    <p className="text-xs text-gray-600 mt-1">
                      Last: "{lastCommand}" ({Math.round(confidence * 100)}%)
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={speakCurrentStep}
                className="w-full"
                disabled={!speechSupported || !currentStep}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                Speak Step
              </Button>
              
              {isSpeaking && (
                <div className="text-center">
                  <Badge variant="default">Speaking...</Badge>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={startStepTimer}
                className="w-full"
                disabled={!currentStep?.duration}
              >
                <Clock className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
              
              {currentStep?.duration && (
                <div className="text-center">
                  <Badge variant="secondary">{currentStep.duration} min</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Display */}
      {currentStep && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <div className="flex items-center gap-2">
                {currentStep.isCompleted && (
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Progress value={progress} className="mb-2" />
              <p className="text-lg">{currentStep.instruction}</p>
            </div>
            
            {/* Step Details */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {currentStep.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{currentStep.duration} minutes</span>
                </div>
              )}
              
              {currentStep.temperature && (
                <div className="flex items-center gap-2">
                  <span className="text-red-500">🌡️</span>
                  <span>{currentStep.temperature}</span>
                </div>
              )}
              
              {currentStep.equipment && currentStep.equipment.length > 0 && (
                <div className="flex items-center gap-2">
                  <span>🔧</span>
                  <span>{currentStep.equipment.join(', ')}</span>
                </div>
              )}
              
              {currentStep.ingredients && currentStep.ingredients.length > 0 && (
                <div className="flex items-center gap-2">
                  <span>🥘</span>
                  <span>{currentStep.ingredients.join(', ')}</span>
                </div>
              )}
            </div>
            
            {/* Manual Controls */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={markStepComplete}
                disabled={currentStep.isCompleted}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Step
              </Button>
              
              <Button
                variant="outline"
                onClick={nextStep}
                disabled={currentStepIndex === steps.length - 1}
              >
                Next
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  index === currentStepIndex
                    ? 'border-blue-500 bg-blue-50'
                    : step.isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
                onClick={() => goToStep(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Step {index + 1}</span>
                      {step.isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {step.duration && (
                        <Badge variant="outline" className="text-xs">
                          {step.duration} min
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{step.instruction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Extend Window interface for Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}