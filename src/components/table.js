import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  // ActivityIndicator,
} from "react-native";
import { Card, Text } from "react-native-paper";
// import { toast } from "sonner-native";
import ShimmerPlaceholder from "./shimmerLoaderPlaceholder";
import ErrorMessage from "./errorMessage";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Button, Dialog, Portal, PaperProvider } from "react-native-paper";
import { useTheme } from "../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(() => {
  return  StyleSheet.create(
      {
        text: {
          color: theme.text,
        },
        heading: {
          color: theme.heading,
          fontSize: 18,
        },
        titleContainer: {
          paddingBottom: 0,
          marginBottom: -10,
        },
      },
      [theme]
    );
  });
};
const ListTable = ({ customerData, loading, orderListError, navigation }) => {
  const { theme } = useTheme();

  const [visible, setVisible] = React.useState(false);
  const customerId = useRef(null);
  const showDialog = (id) => {
    setVisible(true);
    customerId.current = id;
  };
  const styles = useStyle(theme);

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
  const UpdateCustomerHandler = () => {
    navigation.navigate("createCustomer", { customer_id: customerId.current });
    setVisible(false);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {customerData?.length > 0 && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            data={customerData || []}
            keyExtractor={(item) => item?.node?.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            renderItem={({ item, index }) => {
              const isEven = index % 2 === 0;
              return (
                <Card
                  style={{
                    backgroundColor: theme.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      paddingRight: 15,
                    }}
                  >
                    <View>
                      <Card.Title
                        style={styles.titleContainer}
                        titleStyle={styles.heading}
                        title={`${item?.node?.firstName} ${item?.node?.lastName}`}
                      />
                      <Card.Content>
                        {item?.node?.phoneNumber ? (
                          <Text style={styles.text} variant="bodyMedium">
                            {item?.node?.phoneNumber}
                          </Text>
                        ) : null}
                      </Card.Content>
                    </View>

                    <TouchableOpacity
                      onPress={() => showDialog(item?.node?.id)}
                    >
                      <Icon
                        name="ellipsis-vertical-outline"
                        color={"#FFFFFF"}
                        size={25}
                      />
                    </TouchableOpacity>
                  </View>

                  <Card.Actions> </Card.Actions>
                </Card>
              );
            }}
          />
        )}
        ;
        <View>
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
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};
export default ListTable;
