import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Moon, Sparkles, Wind } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';
import { Modality } from '@/mocks/audio';

const { width } = Dimensions.get('window');

export default function ListenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enterFlow, membership, allModalities } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [pulseAnim, glowAnim]);

  const handleEnterFlow = () => {
    enterFlow();
    router.push('/player');
  };

  const handleQuickFlow = (filter: string) => {
    switch (filter) {
      case 'sleep':
        enterFlow({ sleepSafe: true, maxIntensityLevel: 3 });
        break;
      case 'trip':
        enterFlow({ tripSafe: true });
        break;
      case 'breathwork':
        enterFlow({ noVoice: true });
        break;
      default:
        enterFlow();
    }
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.surfaceGlow, Colors.dark.background, Colors.dark.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>SANGUINE</Text>
          <Text style={styles.subtitle}>Sound Therapy</Text>
        </View>

        <View style={styles.flowSection}>
          <Animated.View style={[styles.flowGlow, { opacity: glowAnim }]} />
          
          <TouchableOpacity 
            style={styles.flowButton}
            onPress={handleEnterFlow}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.flowButtonInner, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[Colors.dark.primaryGlow, 'transparent']}
                style={styles.flowButtonGradient}
              />
              <Play 
                color={Colors.dark.primary} 
                size={40} 
                fill={Colors.dark.primary}
                strokeWidth={0}
              />
            </Animated.View>
          </TouchableOpacity>
          
          <Text style={styles.flowTitle}>Enter the Flow</Text>
          <Text style={styles.flowDescription}>
            Continuous, uninterrupted listening{'\n'}curated for deep states
          </Text>
        </View>

        <View style={styles.quickFilters}>
          <Text style={styles.sectionLabel}>QUICK FLOWS</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('sleep')}
            >
              <Moon color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>Sleep Safe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('trip')}
            >
              <Sparkles color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>Journey Safe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('breathwork')}
            >
              <Wind color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>No Voice</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.themesSection}>
          <Text style={styles.sectionLabel}>MODALITIES</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesScroll}
          >
            {allModalities.map((modality: Modality) => (
              <TouchableOpacity 
                key={modality.id}
                style={styles.themeCard}
                onPress={() => router.push(`/theme/${modality.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: modality.imageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400' }} style={styles.themeImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.themeGradient}
                />
                <View style={styles.themeContent}>
                  <Text style={styles.themeName}>{modality.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Au'Dio</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    ...typography.displayLarge,
    color: Colors.dark.primary,
    letterSpacing: 8,
  },
  subtitle: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginTop: 8,
  },
  flowSection: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  flowGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.primary,
    top: -20,
  },
  flowButton: {
    marginBottom: 24,
  },
  flowButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  flowButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  flowTitle: {
    ...typography.title,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  flowDescription: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickFilters: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterText: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  themesSection: {
    marginBottom: 40,
  },
  themesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  themeCard: {
    width: width * 0.4,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  themeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  themeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  themeContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  themeName: {
    ...typography.subtitle,
    color: Colors.dark.text,
  },
  themeCount: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    opacity: 0.5,
  },
});
