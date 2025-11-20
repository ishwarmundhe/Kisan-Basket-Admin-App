import { SafeAreaView } from "react-native-safe-area-context";

import ProductVariantsScreen from "../../../components/custom/table";
import Header from "../../../components/custom/header";

const EditProduct = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProductVariantsScreen />
    </SafeAreaView>
  );
};
export default EditProduct;
