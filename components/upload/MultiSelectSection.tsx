import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MultiSelectSectionProps {
  sectionTitle: string;
  sectionKey: string;
  items: { id: string; name: string }[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading?: boolean;
  expandedSection: string | null;
  toggleSection: (section: string) => void;
  toggleSelection: (id: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => void;
}

export default function MultiSelectSection({
  sectionTitle,
  sectionKey,
  items,
  selected,
  setSelected,
  isLoading,
  expandedSection,
  toggleSection,
  toggleSelection,
}: MultiSelectSectionProps) {
  const isExpanded = expandedSection === sectionKey;

  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection(sectionKey)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>
          {sectionTitle} {selected.length > 0 && `(${selected.length})`}
        </Text>
        {isExpanded ? (
          <ChevronUp color={Colors.dark.textMuted} size={20} />
        ) : (
          <ChevronDown color={Colors.dark.textMuted} size={20} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.checkboxGrid}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>No options available</Text>
          ) : (
            items.map(item => {
              const isSelected = selected.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checkboxItem,
                    isSelected && styles.checkboxItemSelected
                  ]}
                  onPress={() => toggleSelection(item.id, selected, setSelected)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxChecked
                  ]}>
                    {isSelected && (
                      <Check color={Colors.dark.background} size={12} strokeWidth={3} />
                    )}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    isSelected && styles.checkboxLabelSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  checkboxItemSelected: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  checkboxLabelSelected: {
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    padding: 12,
  },
});
