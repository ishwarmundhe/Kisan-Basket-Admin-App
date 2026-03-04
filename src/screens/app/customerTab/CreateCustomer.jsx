import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { toast } from "sonner-native";
import { colors } from "../../../constant/Colors";
import {
  ADD_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_UPDATE,
  UPDATE_CUSTOMER_INFO,
} from "../../../graphql/Mutation";
import { CUSTOMER_DETAILS } from "../../../graphql/Query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        keyboardAvoidingView: {
          flex: 1,
          backgroundColor: theme.background, // Zinc 950
        },
        scrollView: {
          flex: 1,
          backgroundColor: theme.background,
        },
        scrollContent: {
          paddingBottom: 80,
          paddingHorizontal: 4, // Prevent cards from touching edges
        },

        // --- SECTIONS ---
        section: {
          backgroundColor: theme.primary, // Zinc 900
          borderWidth: 1,
          borderColor: theme.border, // Zinc 800
          borderRadius: 12,
          marginTop: 16,
          paddingHorizontal: 16,
          paddingVertical: 20,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: theme.heading, // White
          marginBottom: 20,
        },

        // --- INPUTS ---
        inputContainer: {
          marginBottom: 20,
        },
        inputLabel: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.secondary, // Zinc 400 (Muted)
          marginBottom: 8,
        },
        required: {
          color: "#EF4444", // Red 500
        },
        input: {
          borderWidth: 1,
          borderColor: theme.border, // Zinc 800
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 15,
          color: theme.text, // White
          backgroundColor: theme.background, // Zinc 950 (Inset look inside the card)
          minHeight: 48,
        },
        inputError: {
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.05)", // Subtle red tint
        },
        inputValid: {
          borderColor: theme.success || "#10B981",
        },
        errorText: {
          fontSize: 12,
          color: "#EF4444",
          marginTop: 6,
          marginLeft: 2,
        },

        // --- PICKER / SELECT ---
        pickerContainer: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          marginBottom: 8,
          backgroundColor: theme.background,
          overflow: "hidden",
        },
        picker: {
          color: theme.text,
          backgroundColor: theme.background,
        },
        item: {
          color: theme.text,
          backgroundColor: theme.background,
        },
        selectContainer: {
          borderWidth: 1,
          borderColor: theme.border, // Zinc 800
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: theme.background, // Zinc 950
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 48,
        },
        selectText: {
          fontSize: 15,
          color: theme.text,
        },
        selectArrow: {
          fontSize: 12,
          color: theme.secondary,
        },

        // --- BUTTONS ---
        saveButton: {
          backgroundColor: theme.textSecondary, // White Background
          marginVertical: 24,
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        },
        saveButtonDisabled: {
          opacity: 0.5,
          backgroundColor: theme.border, // Zinc 800 if disabled
        },
        saveButtonText: {
          color: theme.background, // Black Text (Inverted)
          fontSize: 16,
          fontWeight: "700",
        },
      },
      [theme],
    );
  });
};
const PersonalInformationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  // Hooks at the top level
  const { customer_id } = route?.params || {};
  const [mode, setMode] = useState(customer_id ? "edit" : "create");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "Pune",
    zipCode: "431041",
    country: "IN",
    state: "Maharashtra",
  });
  const [errors, setErrors] = useState({});
  const [selectedLocations, setSelectedLocations] = useState("");
  const address_id = useRef(null);

  //  css
  const styles = useStyle(theme);

  // GraphQL operations
  const [fetchCustomerDetails, { data: customerData, loading: isFetching }] =
    useLazyQuery(CUSTOMER_DETAILS);
  const [updateCustomerAddress, { loading: updateLoading }] = useMutation(
    UPDATE_CUSTOMER_UPDATE
  );
  const [updateCustomerInfo] = useMutation(UPDATE_CUSTOMER_INFO);
  const [addCustomerAddress, { loading: createLoading }] =
    useMutation(ADD_CUSTOMER_ADDRESS);

  // Data fetching effect
  useEffect(() => {
    if (customer_id) {
      fetchCustomerDetails({ variables: { id: customer_id } });
    }
  }, [customer_id]);

  // Form population effect
  useEffect(() => {
    if (customerData?.user) {
      const { email } = customerData.user;
      const firstAddress = customerData.user.addresses?.[0];

      if (firstAddress) {
        const {
          firstName,
          lastName,
          city,
          streetAddress1,
          phone,
          companyName,
          postalCode,
          id,
        } = firstAddress;
        address_id.current = id;
        setFormData({
          firstName: firstName || "",
          lastName: lastName || "",
          email: email || "",
          company: companyName || "",
          phoneNumber: phone || "",
          addressLine1: streetAddress1 || "",
          city: city || "Pune",
          zipCode: postalCode || "431041",
          country: "IN",
          state: "Maharashtra",
        });
      }
    }
  }, [customerData]);

  // Constants
  const locations = [
    { label: "Hadapsar", value: "hadapsar" },
    { label: "Magarpatta", value: "magarpatta" },
    { label: "Baner", value: "baner" },
  ];

  // Validation functions
  const validateField = useCallback((field, value) => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        return;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        return;
      case "addressLine1":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 5) return "Please enter a complete address";
        return;
      default:
        return;
    }
  }, []);

  // Form handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleInputBlur = useCallback(
    (field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData, validateField]
  );

  const validateForm = useCallback(() => {
    const requiredFields = ["firstName", "lastName", "addressLine1"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Data mapping
  const mapFormToAddress = useCallback(
    (form) => ({
      city: form.city,
      companyName: form.company,
      country: form.country,
      countryArea: form.state,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phoneNumber,
      postalCode: form.zipCode,
      streetAddress1: form.addressLine1,
      streetAddress2: selectedLocations,
    }),
    [selectedLocations]
  );

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (mode === "create") {
        const input = {
          defaultBillingAddress: mapFormToAddress(formData),
          defaultShippingAddress: mapFormToAddress(formData),
          email: formData.email || null,
          phoneNumber: formData.phoneNumber || null,
          firstName: formData.firstName,
          lastName: formData.lastName,
        };

        const { data } = await addCustomerAddress({ variables: { input } });
        const error = data?.customerCreate?.errors?.[0];

        if (error) {
          toast.error(
            `${error.field} ${error.message}` || "Customer creation failed!"
          );
          return;
        }

        toast.success("Added successfully");
        navigation.goBack();
      } else {
        const [customerResult, addressResult] = await Promise.all([
          updateCustomerInfo({
            variables: {
              id: customer_id,
              input: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phoneNumber: formData.phoneNumber || undefined,
              },
            },
          }),
          updateCustomerAddress({
            variables: {
              id: address_id.current,
              input: mapFormToAddress(formData),
            },
          }),
        ]);

        const customerErrors =
          customerResult.data?.customerUpdate?.errors || [];
        const addressErrors = addressResult.data?.addressUpdate?.errors || [];

        if (customerErrors.length || addressErrors.length) {
          const errorMessage = [...customerErrors, ...addressErrors]
            .map((e) => `${e.field}: ${e.message}`)
            .join("\n");
          throw new Error(errorMessage);
        }

        toast.success("Profile updated successfully");
        navigation.goBack();
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      // console.error("Error:", error);
    }
  }, [
    mode,
    formData,
    validateForm,
    mapFormToAddress,
    addCustomerAddress,
    updateCustomerInfo,
    updateCustomerAddress,
    customer_id,
    navigation,
  ]);

  // UI components
  const renderInput = useCallback(
    (
      label,
      field,
      placeholder,
      isRequired = false,
      keyboardType = "default"
    ) => {
      const hasError = errors[field];
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {label}
            {isRequired && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={[
              styles.input,
              hasError && styles.inputError,
              formData[field] && !hasError && styles.inputValid,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            onBlur={() => isRequired && handleInputBlur(field)}
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          />
          {hasError && <Text style={styles.errorText}>{hasError}</Text>}
        </View>
      );
    },
    [formData, errors, handleInputChange, handleInputBlur]
  );

  const renderSelectInput = useCallback(
    (label, value, isRequired = false) => (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={styles.selectContainer}>
          <Text style={styles.selectText}>{value}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </View>
      </View>
    ),
    []
  );

  const isLoading = createLoading || updateLoading || isFetching;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={{ flex: 1, marginHorizontal: 10 }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {renderInput(
              "First Name",
              "firstName",
              "Enter your first name",
              true
            )}
            {renderInput("Last Name", "lastName", "Enter your last name", true)}
            {renderInput(
              "Email Address",
              "email",
              "Enter your email address",
              false,
              "email-address"
            )}
            {renderInput(
              "Phone Number",
              "phoneNumber",
              "Enter your phone number",
              false,
              "phone-pad"
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            {renderInput(
              "Address Line 1",
              "addressLine1",
              "Enter street address",
              true
            )}
            <Text style={styles.label}>Primary Location:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                dropdownIconColor="white"
                selectedValue={selectedLocations}
                onValueChange={setSelectedLocations}
                themeVariant="dark"
              >
                {locations.map((item) => (
                  <Picker.Item
                    style={styles.item}
                    label={item.label}
                    value={item.value}
                    key={item.value}
                  />
                ))}
              </Picker>
            </View>
            {renderInput("City", "city", "Enter city")}
            {renderInput("ZIP Code", "zipCode", "Enter ZIP code")}
            {renderSelectInput("Country", formData.country, true)}
            {renderSelectInput("State/Province/Area", formData.state, true)}
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                {mode === "create" ? "Create Customer" : "Update Customer"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export default React.memo(PersonalInformationScreen);
