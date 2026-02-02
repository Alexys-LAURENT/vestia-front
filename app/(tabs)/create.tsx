import { ActionButtons } from '@/components/create/ActionButtons';
import { BottomBar } from '@/components/create/BottomBar';
import { EmptyLookState } from '@/components/create/EmptyLookState';
import { ErrorState } from '@/components/create/ErrorState';
import { GeneratedLookDisplay } from '@/components/create/GeneratedLookDisplay';
import { GeneratingLookAnimation } from '@/components/create/GeneratingLookAnimation';
import { LookReasonsSheet } from '@/components/create/LookReasonsSheet';
import { WeatherHeader } from '@/components/create/WeatherHeader';
import { PlanLookSheet } from '@/components/sheets/PlanLookSheet';
import PickItemsSheet from '@/components/sheets/PickItemsSheet';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCreateLook } from '@/hooks/useCreateLook';
import { usePlannedOutfits } from '@/hooks/usePlannedOutfits';
import { Item, Look } from '@/types/entities';
import { SuccessResponse } from '@/types/requests';
import { api } from '@/utils/fetchApi';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateScreen = () => {
  const [generatedItems, setGeneratedItems] = useState<(Item & {reason:string, isForced:boolean})[]>([]);
  const [isGenerationLoading, setIsGenerationLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [forcedItems, setForcedItems] = useState<Item[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherDate, setWeatherDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReasonsSheet, setShowReasonsSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookChosen, setLookChosen] = useState(false);
  const [savedLook, setSavedLook] = useState<Look | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();
  const { createLook, isLoading: isCreatingLook } = useCreateLook();
  const { createPlannedOutfit, isLoading: isPlanningOutfit } = usePlannedOutfits();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isGenerationLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isGenerationLoading, pulseAnim]);

  React.useEffect(() => {
    if (showResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showResult, fadeAnim]);

  const handleGenerateLook = async(notLikedLook?: Item[]) => {
    
    setShowResult(false);
    setIsGenerationLoading(true);
    setError(null);
    
    try {
     const body: {
        forcedItemIds: number[];
        shouldIncludeWeather: boolean;
        weatherDate?: string;
        notLikedLookItemsIds?: number[];
      } = {
        forcedItemIds: forcedItems.map(item => item.idItem),
        shouldIncludeWeather: weatherEnabled,
      };

      if (weatherEnabled) {
        body.weatherDate = weatherDate.toISOString();
      }

      if (notLikedLook && notLikedLook.length > 0) {
        body.notLikedLookItemsIds = notLikedLook.map(item => item.idItem);
      }

      const res = await api.post<SuccessResponse<
      {
        items: (Item & {reason:string, isForced:boolean})[],
        generalReasoning: string;
        generationMethod : "ai" | "fallback";
        forcedItemsCount: number;
      }>>('/looks/generate', body);

      console.log(res);
      if("error" in res){
        
        setError(typeof res.error === 'string' ? res.error : 'Une erreur est survenue lors de la génération du look');
        setIsGenerationLoading(false);
        return;
      }
      
      setGeneratedItems(res.data.items);
      setIsGenerationLoading(false);
      setShowResult(true);
    } catch {
      setError('Impossible de se connecter au serveur');
      setIsGenerationLoading(false);
    }
  };

  const removeForcedItem = (itemId: number) => {
    setForcedItems(prev => prev.filter(item => item.idItem !== itemId));
  };

  const handleRegenerate = () => {
    const notLikedItems = generatedItems.filter(item => !item.isForced);
    console.log(notLikedItems);
    
    handleGenerateLook(notLikedItems);
  };

  const handleChoose = () => {
    setLookChosen(true);
  };

  const handleSave = async () => {
    const itemIds = generatedItems.map(item => item.idItem);
    const look = await createLook(itemIds);

    if (look) {
      setSavedLook(look);
      Alert.alert('Succès', 'Tenue sauvegardée dans votre garde-robe !');
      resetAll();
    } else {
      Alert.alert('Erreur', 'Impossible de sauvegarder la tenue');
    }
  };

  const handlePlan = () => {
    setShowPlanSheet(true);
  };

  const handleConfirmPlan = async (date: Date, notes?: string) => {
    let lookToSave = savedLook;

    // Si la tenue n'a pas encore été sauvegardée, la sauvegarder d'abord
    if (!lookToSave) {
      const itemIds = generatedItems.map(item => item.idItem);
      lookToSave = await createLook(itemIds);

      if (!lookToSave) {
        Alert.alert('Erreur', 'Impossible de sauvegarder la tenue');
        return;
      }
      setSavedLook(lookToSave);
    }

    // Planifier la tenue
    const plannedOutfit = await createPlannedOutfit(lookToSave.idLook, date, notes);

    if (plannedOutfit) {
      Alert.alert('Succès', 'Tenue planifiée avec succès !');
      resetAll();
      router.push('/(tabs)/calendar');
    } else {
      Alert.alert('Erreur', 'Impossible de planifier la tenue');
    }
  };

  const handleDismiss = () => {
    resetAll();
  };

  const resetAll = () => {
    setLookChosen(false);
    setSavedLook(null);
    setShowResult(false);
    setGeneratedItems([]);
  };

  const handleReasonsPress = () => {
    setShowReasonsSheet(true);
  };

  return (
    <>
      <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['top']}>
        <View className="flex-1">
          
          {/* Header avec météo */}
          <WeatherHeader
            weatherEnabled={weatherEnabled}
            weatherDate={weatherDate}
            showDatePicker={showDatePicker}
            onWeatherToggle={setWeatherEnabled}
            onDatePress={() => setShowDatePicker(true)}
            onDateChange={setWeatherDate}
            onDatePickerClose={() => setShowDatePicker(false)}
          />

          {/* Zone de génération (flex-1) */}
          <View className="flex-1 px-4">
            {error && <ErrorState message={error} />}
            
            {!error && !showResult && !isGenerationLoading && <EmptyLookState />}

            {!error && isGenerationLoading && <GeneratingLookAnimation pulseAnim={pulseAnim} />}

            {!error && showResult && generatedItems.length > 0 && (
              <GeneratedLookDisplay
                items={generatedItems}
                fadeAnim={fadeAnim}
                onReasonsPress={handleReasonsPress}
                onRegenerate={handleRegenerate}
                onChoose={handleChoose}
                mode={lookChosen ? 'chosen' : 'choosing'}
                actionButtons={
                  lookChosen ? (
                    <ActionButtons
                      onSave={handleSave}
                      onPlan={handlePlan}
                      onDismiss={handleDismiss}
                      isLoading={isCreatingLook || isPlanningOutfit}
                    />
                  ) : undefined
                }
              />
            )}
          </View>



          {/* Items forcés et barre du bas */}
          <BottomBar
            forcedItems={forcedItems}
            onAddItems={() => setIsSheetOpen(true)}
            onRemoveItem={removeForcedItem}
            onGenerate={handleGenerateLook}
            isGenerating={isGenerationLoading}
          />

        </View>
      </SafeAreaView>

      {/* Sheet pour afficher les raisons des choix */}
      <LookReasonsSheet
        isOpen={showReasonsSheet}
        items={generatedItems}
        onClose={() => setShowReasonsSheet(false)}
      />

      {/* Sheet de sélection d'items */}
      <PickItemsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        callback={setForcedItems}
        initialSelectedItems={forcedItems}
      />

      {/* Sheet de planification */}
      <PlanLookSheet
        isOpen={showPlanSheet}
        onClose={() => setShowPlanSheet(false)}
        onConfirm={handleConfirmPlan}
      />
    </>
  );
};

export default CreateScreen;