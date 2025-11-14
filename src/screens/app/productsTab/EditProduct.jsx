import { SafeAreaView } from "react-native-safe-area-context";

import ProductVariantsScreen from "../../../components/table";
import Header from "../../../components/header";

const EditProduct = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProductVariantsScreen />
    </SafeAreaView>
  );
};
export default EditProduct;
