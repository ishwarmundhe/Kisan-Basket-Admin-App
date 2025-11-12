import { SafeAreaView } from "react-native";
import ProductVariantsScreen from "../../../components/table";
import Header from "../../../components/header";

const EditProduct = ({navigation}) => {
    return(
        <SafeAreaView style={{flex:1}}>
         
            <ProductVariantsScreen/>
        </SafeAreaView>
    )
};
export default EditProduct;