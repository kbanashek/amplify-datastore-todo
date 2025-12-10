import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MenuItem {
  name: string;
  route: string;
  icon: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    name: 'Activities',
    route: '/(tabs)/activities',
    icon: 'doc.text.fill',
    description: 'Manage activities',
  },
  {
    name: 'Data Points',
    route: '/(tabs)/datapoints',
    icon: 'chart.bar.fill',
    description: 'View data points',
  },
  {
    name: 'Questions',
    route: '/(tabs)/questions',
    icon: 'questionmark.circle.fill',
    description: 'Manage questions',
  },
  {
    name: 'Task Answers',
    route: '/(tabs)/task-answers',
    icon: 'text.bubble.fill',
    description: 'View task answers',
  },
  {
    name: 'Task Results',
    route: '/(tabs)/task-results',
    icon: 'list.bullet.rectangle.portrait.fill',
    description: 'View task results',
  },
  {
    name: 'Task History',
    route: '/(tabs)/task-history',
    icon: 'clock.fill',
    description: 'View task history',
  },
];

interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  console.log('[NavigationMenu] Rendering, visible:', visible, 'items:', menuItems.length);

  const handleNavigate = (route: string) => {
    console.log('[NavigationMenu] Navigating to:', route);
    try {
      router.push(route as any);
      onClose();
    } catch (error) {
      console.error('[NavigationMenu] Navigation error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <Pressable 
          style={styles.overlay} 
          onPress={onClose}
          android_disableSound={true}
        />
        <Pressable 
          style={styles.menuContainer} 
          onPress={(e) => {
            e.stopPropagation();
          }}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Navigation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.menuList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuListContent}
          >
            {menuItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No navigation options available</Text>
              </View>
            ) : (
              menuItems.map((item, index) => {
                console.log('[NavigationMenu] Rendering item', index, item.name);
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={styles.menuItem}
                    onPress={() => handleNavigate(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemIcon}>
                      <IconSymbol
                        name={item.icon as any}
                        size={24}
                        color={colors.tint}
                      />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text style={[styles.menuItemDescription, { color: colors.tabIconDefault }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={colors.tabIconDefault}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    // Ensure menu container blocks touches
    pointerEvents: 'auto',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    flexShrink: 1,
    flexGrow: 0,
  },
  menuListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#747d8c',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 13,
  },
});

