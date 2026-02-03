import { ItemMenuSheetButton } from '@/components/itemPage/ItemMenuSheetButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/ui/header';
import { Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import { fetchApi } from '@/utils/fetchApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SuccessResponse } from '../../types/requests';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.25; // Ratio 4:5 pour aesthetic fashion

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme() ?? 'light';

  // Animations
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      
      // Animate in after data loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      setError('Unable to load item details');
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
        <ThemedText style={{ color: textColor }}>{error || 'Item not found'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header 
        title={item.name} 
        actionComponent={<ItemMenuSheetButton itemId={item.idItem} onEditSuccess={loadItem} />}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
        
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <ThemedText
              style={[
                styles.itemName,
                {
                  color: textColor,
                  fontSize: Typography.size.title,
                  fontWeight: Typography.weight.bold,
                  fontFamily: Typography.family.display,
                },
              ]}
            >
              {item.name}
            </ThemedText>
            
            {item.brand && (
              <ThemedText
                style={[
                  styles.brand,
                  {
                    color: textSecondary,
                    fontSize: Typography.size.subheading,
                    fontWeight: Typography.weight.regular,
                    fontStyle: 'italic',
                  },
                ]}
              >
                {item.brand}
              </ThemedText>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Details Section */}
          <View style={styles.section}>
            <ThemedText
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                  fontSize: Typography.size.micro,
                  fontWeight: Typography.weight.semibold,
                },
              ]}
            >
              DÉTAILS
            </ThemedText>
            
            <View style={styles.detailsGrid}>
              <DetailRow label="TYPE" value={item.type} textColor={textSecondary} textTertiary={textTertiary} />
              <DetailRow label="SAISON" value={item.season} textColor={textSecondary} textTertiary={textTertiary} />
              <DetailRow label="FORMALITÉ" value={item.formality} textColor={textSecondary} textTertiary={textTertiary} />
              <DetailRow label="COULEUR" value={item.mainColor} textColor={textSecondary} textTertiary={textTertiary} />
            </View>
          </View>

          {/* Description Section */}
          {item.description && (
            <>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              
              <View style={styles.section}>
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    {
                      color: textColor,
                      fontSize: Typography.size.micro,
                      fontWeight: Typography.weight.semibold,
                    },
                  ]}
                >
                  DESCRIPTION
                </ThemedText>
                
                <ThemedText
                  style={[
                    styles.description,
                    {
                      color: textSecondary,
                      fontSize: Typography.size.body,
                      fontWeight: Typography.weight.regular,
                      lineHeight: Typography.size.body * Typography.lineHeight.relaxed,
                    },
                  ]}
                >
                  {item.description}
                </ThemedText>
              </View>
            </>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: Spacing['3xl'] }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Helper component for detail rows
const DetailRow: React.FC<{ label: string; value: string; textColor: string; textTertiary: string }> = ({
  label,
  value,
  textColor,
  textTertiary,
}) => (
  <View style={styles.detailRow}>
    <ThemedText
      style={[
        styles.detailLabel,
        {
          color: textTertiary,
          fontSize: Typography.size.caption,
          fontWeight: Typography.weight.medium,
        },
      ]}
    >
      {label}
    </ThemedText>
    <ThemedText
      style={[
        styles.detailValue,
        {
          color: textColor,
          fontSize: Typography.size.body,
          fontWeight: Typography.weight.regular,
        },
      ]}
    >
      {value}
    </ThemedText>
  </View>
);

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
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  itemName: {
    letterSpacing: Typography.letterSpacing.tight,
    marginBottom: Spacing.xs,
    lineHeight: Typography.size.title * 1.2,
  },
  brand: {
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    letterSpacing: Typography.letterSpacing.wide,
    marginBottom: Spacing.base,
    textTransform: 'uppercase',
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailValue: {
    letterSpacing: -0.2,
  },
  description: {
    letterSpacing: -0.2,
  },
});
