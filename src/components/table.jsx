import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Card,
  Text,
  Button,
  Dialog,
  Portal,
  PaperProvider,
} from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

import ShimmerPlaceholder from "./shimmerLoaderPlaceholder";
import ErrorMessage from "./errorMessage";
import { useTheme } from "../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(
    () =>
      StyleSheet.create({
        text: {
          color: theme.text,
          fontSize: 15,
        },
        heading: {
          color: theme.heading,
          fontSize: 18,
          fontWeight: "600",
        },
        card: {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 15,
        },
      }),
    [theme]
  );
};

const ListTable = ({ customerData, loading, orderListError, navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [visible, setVisible] = React.useState(false);
  const customerId = useRef(null);

  const showDialog = (id) => {
    setVisible(true);
    customerId.current = id;
  };

  const UpdateCustomerHandler = () => {
    navigation.navigate("createCustomer", { customer_id: customerId.current });
    setVisible(false);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.primary,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <ShimmerPlaceholder height={30} width="60%" borderRadius={6} />
              <View style={{ marginTop: 5 }}>
                <ShimmerPlaceholder height={16} width="80%" borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  if (orderListError) {
    return <ErrorMessage errorMessage={orderListError} />;
  }

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          data={customerData || []}
          keyExtractor={(item) => item?.node?.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const user = item?.node;

            return (
              <Card style={styles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* LEFT SIDE */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.heading, { flexShrink: 1 }]}
                      numberOfLines={2}
                    >
                      {user?.firstName} {user?.lastName}
                    </Text>

                    {!!user?.phoneNumber && (
                      <Text style={[styles.text, { opacity: 0.8 }]}>
                        {user.phoneNumber}
                      </Text>
                    )}
                  </View>

                  {/* RIGHT ICON */}
                  <TouchableOpacity onPress={() => showDialog(user?.id)}>
                    <Icon
                      name="ellipsis-vertical-outline"
                      color={theme.text}
                      size={24}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }}
        />

        {/* CONFIRMATION DIALOG */}
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Update</Dialog.Title>

            <Dialog.Content>
              <Text variant="bodyMedium">
                Are you sure you want to update the customer's address?
              </Text>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Cancel</Button>
              <Button onPress={UpdateCustomerHandler}>Update</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default ListTable;
