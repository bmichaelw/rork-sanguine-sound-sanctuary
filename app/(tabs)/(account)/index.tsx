import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown,
  Moon,
  Bell,
  Shield,
  HelpCircle,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { membership, setMembership } = useAudio();
  const [sleepTimer, setSleepTimer] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const handleToggleMembership = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMembership(!membership.isPaid, 'sanguine');
  };

  const handleToggle = (setter: (value: boolean) => void) => (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setter(value);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.surfaceGlow, Colors.dark.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Account</Text>

        <View style={styles.membershipCard}>
          <LinearGradient
            colors={membership.isPaid 
              ? [Colors.dark.primaryGlow, Colors.dark.surface]
              : [Colors.dark.surface, Colors.dark.surface]
            }
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.membershipHeader}>
            <View style={[
              styles.membershipIcon,
              membership.isPaid && styles.membershipIconActive
            ]}>
              {membership.isPaid ? (
                <Crown color={Colors.dark.primary} size={24} />
              ) : (
                <Sparkles color={Colors.dark.textMuted} size={24} />
              )}
            </View>
            
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipLabel}>
                {membership.isPaid ? 'SANGUINE MEMBER' : 'FREE ACCOUNT'}
              </Text>
              <Text style={styles.membershipTitle}>
                {membership.isPaid ? 'Full Access' : 'Preview Mode'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.membershipDescription}>
            {membership.isPaid 
              ? 'Unlimited access to all tracks, flows, and features. Your support keeps this sanctuary alive.'
              : 'Preview tracks for 10 seconds. Upgrade to unlock full access to the sanctuary.'
            }
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.membershipButton,
              membership.isPaid && styles.membershipButtonActive
            ]}
            onPress={handleToggleMembership}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.membershipButtonText,
              membership.isPaid && styles.membershipButtonTextActive
            ]}>
              {membership.isPaid ? 'Manage Membership' : 'Become a Member'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Moon color={Colors.dark.textSecondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sleep Timer</Text>
              <Text style={styles.settingDescription}>Fade audio after a set time</Text>
            </View>
            <Switch
              value={sleepTimer}
              onValueChange={handleToggle(setSleepTimer)}
              trackColor={{ false: Colors.dark.surface, true: Colors.dark.primaryMuted }}
              thumbColor={sleepTimer ? Colors.dark.primary : Colors.dark.textMuted}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Bell color={Colors.dark.textSecondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>New content and updates</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleToggle(setNotifications)}
              trackColor={{ false: Colors.dark.surface, true: Colors.dark.primaryMuted }}
              thumbColor={notifications ? Colors.dark.primary : Colors.dark.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <HelpCircle color={Colors.dark.textSecondary} size={20} />
            </View>
            <Text style={styles.linkTitle}>Help & FAQ</Text>
            <ChevronRight color={Colors.dark.textMuted} size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Mail color={Colors.dark.textSecondary} size={20} />
            </View>
            <Text style={styles.linkTitle}>Contact Us</Text>
            <ChevronRight color={Colors.dark.textMuted} size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Shield color={Colors.dark.textSecondary} size={20} />
            </View>
            <Text style={styles.linkTitle}>Privacy Policy</Text>
            <ChevronRight color={Colors.dark.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>SANGUINE</Text>
          <Text style={styles.footerSubtitle}>Sound Therapy</Text>
          <Text style={styles.footerPowered}>Powered by Au'Dio</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
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
  title: {
    ...typography.displayMedium,
    color: Colors.dark.text,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  membershipCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    marginBottom: 30,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipIconActive: {
    backgroundColor: Colors.dark.primaryGlow,
  },
  membershipInfo: {
    marginLeft: 14,
  },
  membershipLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  membershipTitle: {
    ...typography.title,
    color: Colors.dark.text,
    marginTop: 2,
  },
  membershipDescription: {
    ...typography.body,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  membershipButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  membershipButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  membershipButtonText: {
    ...typography.subtitle,
    color: Colors.dark.background,
    fontWeight: '600' as const,
  },
  membershipButtonTextActive: {
    color: Colors.dark.primary,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.borderSubtle,
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 8,
  },
  settingTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.borderSubtle,
  },
  linkTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerBrand: {
    ...typography.caption,
    color: Colors.dark.primary,
    fontSize: 14,
    letterSpacing: 4,
  },
  footerSubtitle: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  footerPowered: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginTop: 20,
    opacity: 0.5,
    fontSize: 9,
  },
  footerVersion: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginTop: 8,
    opacity: 0.3,
    fontSize: 9,
  },
});
