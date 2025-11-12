// screens/ThemeSettings.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../constant/ThemeContext';
const ThemeSettings = () => {
  const { theme, currentTheme, toggleTheme, themes } = useTheme();

 
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <Text style={[styles.title, { color: theme.text }]}>Choose Theme</Text>
        
        {Object.keys(themes).map((themeKey) => (
          <TouchableOpacity
            key={themeKey}
            style={[
              styles.themeOption,
              { 
                backgroundColor: themes[themeKey].primary,
                borderColor: currentTheme === themeKey ? theme.primary : theme.border,
                borderWidth: currentTheme === themeKey ? 2 : 1,
              }
            ]}
            onPress={() => toggleTheme(themeKey)}
          >
            <View style={styles.themePreview}>
              <View style={[styles.colorBox, { backgroundColor: themes[themeKey].primary }]} />
              <View style={[styles.colorBox, { backgroundColor: themes[themeKey].background }]} />
              <View style={[styles.colorBox, { backgroundColor: themes[themeKey].text }]} />
            </View>
            <Text style={[styles.themeName, { color: theme.text }]}>
              {themes[themeKey].name.charAt(0).toUpperCase() + themes[themeKey].name.slice(1)}
              {currentTheme === themeKey && ' ✓'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 12,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 4,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ThemeSettings;