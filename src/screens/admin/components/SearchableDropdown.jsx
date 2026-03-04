// src/screens/admin/components/SearchableDropdown.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from "react-native";

export default function SearchableDropdown({
  label,
  placeholder,
  data = [],
  onSelect,
  onSearch,
  onChangeText,
  isLoading,
  selectedValue,
  nestedScrollEnabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Debounce for API Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.label || item.name);
    setIsOpen(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsOpen(true)}
        style={styles.inputWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={isOpen ? query : selectedValue || query}
          onChangeText={(text) => {
            setQuery(text);
            setIsOpen(true);
            if (onChangeText) onChangeText(text);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#2E7D32"
            style={styles.loader}
          />
        )}
      </TouchableOpacity>

      {isOpen && data && data.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={data}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={nestedScrollEnabled}
            contentContainerStyle={{ flexGrow: 0 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.label || item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 12,
    color: "#333",
  },
  loader: {
    marginRight: 10,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -2,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200, // <--- Fixed height here for scrolling
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});
