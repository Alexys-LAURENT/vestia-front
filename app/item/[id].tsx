import { ItemMenuSheetButton } from '@/components/itemPage/ItemMenuSheetButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/ui/header';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import { fetchApi } from '@/utils/fetchApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SuccessResponse } from '../../types/requests';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const loadItem = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApi<SuccessResponse<Item>>(`/items/${id}`, {
        method: 'GET',
      });
      
      if("error" in data){
        throw new Error("message" in data ? data.message : "Erreur inconnue");
      }
      setItem(data.data);
    } catch (err) {
      setError('Impossible de charger les détails du vêtement');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id, loadItem]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  
  // Construction sécurisée de l'URL de l'image
  const imageUrl = React.useMemo(() => {
    if (!item?.imageUrl || !API_URL) return null;
    try {
      return encodeURI(`${API_URL}${item.imageUrl}`);
    } catch {
      return null;
    }
  }, [item?.imageUrl, API_URL]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (error || !item) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{error || 'Vêtement introuvable'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header 
        title={item.name} 
        actionComponent={<ItemMenuSheetButton itemId={item.idItem} onEditSuccess={loadItem} />}
      />
      <ScrollView style={styles.scrollView}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>{item.name}</ThemedText>
            {item.brand && (
              <ThemedText style={[styles.brand, { color: iconColor }]}>
                {item.brand}
              </ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Détails</ThemedText>
            
            <View style={styles.row}>
              <ThemedText style={styles.label}>Type :</ThemedText>
              <ThemedText style={styles.value}>{item.type}</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.label}>Saison :</ThemedText>
              <ThemedText style={styles.value}>{item.season}</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.label}>Formalité :</ThemedText>
              <ThemedText style={styles.value}>{item.formality}</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.label}>Couleur principale :</ThemedText>
              <ThemedText style={styles.value}>{item.mainColor}</ThemedText>
            </View>
          </View>

          {item.description ? (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>{item.description}</ThemedText>
            </View>
          ) : null}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  brand: {
    fontSize: 18,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontWeight: '600',
    opacity: 0.8,
  },
  value: {
    flex: 1,
  },
  description: {
    lineHeight: 24,
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
  },
});
