// import React from "react";
// import { PieChart } from "react-native-gifted-charts";
// import { View, Text, } from "react-native";
// import { useTheme } from "../../constant/ThemeContext";
// import { useLazyQuery } from "@apollo/client";
// import { MONTH_TOTAL_ORDERS } from "../../graphql/Query";
// import DateTimePicker from "@react-native-community/datetimepicker";

// const PerformanceChart = ({route}) => {
// const {data} = route?.params || {};

//     const [selectSpecificDate] = useLazyQuery(MONTH_TOTAL_ORDERS);

//     const {theme} = useTheme();
//   const pieData = [
//     {
//       value: 47,
//       color: "#009FFF",
//       gradientCenterColor: "#006DFF",
//       focused: true,
//     },
//     { value: 40, color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
//     { value: 16, color: "#BDB2FA", gradientCenterColor: "#8F80F3" },
//     { value: 3, color: "#FFA5BA", gradientCenterColor: "#FF7F97" },
//   ];

//   const renderDot = (color) => {
//     return (
//       <View
//         style={{
//           height: 10,
//           width: 10,
//           borderRadius: 5,
//           backgroundColor: color,
//           marginRight: 10,
//         }}
//       />
//     );
//   };

//   const renderLegendComponent = () => {
//     return (
//       <>
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "center",
//             marginBottom: 10,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               width: 120,
//               marginRight: 20,
//             }}
//           >
//             {renderDot("#006DFF")}
//             <Text style={{ color: "white" }}>Excellent: 47%</Text>
//           </View>
//           <View
//             style={{ flexDirection: "row", alignItems: "center", width: 120 }}
//           >
//             {renderDot("#8F80F3")}
//             <Text style={{ color: "white" }}>Okay: 16%</Text>
//           </View>
//         </View>
//         <View style={{ flexDirection: "row", justifyContent: "center" }}>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               width: 120,
//               marginRight: 20,
//             }}
//           >
//             {renderDot("#3BE9DE")}
//             <Text style={{ color: "white" }}>Good: 40%</Text>
//           </View>
//           <View
//             style={{ flexDirection: "row", alignItems: "center", width: 120 }}
//           >
//             {renderDot("#FF7F97")}
//             <Text style={{ color: "white" }}>Poor: 3%</Text>
//           </View>
//         </View>
//       </>
//     );
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//       }}
//     >
//       <View
//         style={{
//           margin: 16,
//           padding: 16,
//           borderRadius: 20,
//           backgroundColor: theme.primary,
//           borderColor: theme.border,
//           borderWidth:1
//         }}
//       >
//         <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
//           Performance
//         </Text>
//         <View style={{ padding: 20, alignItems: "center" }}>
//           <PieChart
//             data={pieData}
//             donut
//             showGradient
//             sectionAutoFocus
//             radius={90}
//             innerRadius={60}
//             innerCircleColor={"#232B5D"}
//             centerLabelComponent={() => {
//               return (
//                 <View
//                   style={{ justifyContent: "center", alignItems: "center" }}
//                 >
//                   <Text
//                     style={{ fontSize: 22, color: "white", fontWeight: "bold" }}
//                   >
//                     47%
//                   </Text>
//                   <Text style={{ fontSize: 14, color: "white" }}>
//                     Excellent
//                   </Text>
//                 </View>
//               );
//             }}
//           />
//         </View>
//         {renderLegendComponent()}
//       </View>
//     </View>
//   );
// };
// export default React.memo(PerformanceChart);
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "../../constant/ThemeContext";
import { useLazyQuery } from "@apollo/client/react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PieChart } from "react-native-gifted-charts";
import { MONTH_TOTAL_ORDERS } from "../../graphql/Query";
import moment from "moment";

const PerformanceChart = () => {
  const { theme } = useTheme();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [fetchOrders, { data, loading, error }] =
    useLazyQuery(MONTH_TOTAL_ORDERS);

  const handleFetch = () => {
    fetchOrders({
      variables: {
        gte: moment(startDate).format("YYYY-MM-DD"),
        lte: moment(endDate).format("YYYY-MM-DD"),
      },
    });
  };

  // Example pie data based on fetched totalCount
  const pieData = data
    ? [
        {
          value: data.orders.totalCount,
          color: "#009FFF",
          gradientCenterColor: "#006DFF",
          focused: true,
        },
        {
          value: data.orders.totalCount,
          color: "#93FCF8",
          gradientCenterColor: "#3BE9DE",
        },
      ]
    : [
        {
          value: 47,
          color: "#009FFF",
          gradientCenterColor: "#006DFF",
          focused: true,
        },
        { value: 53, color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
      ];

  const renderDot = (color) => (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10,
      }}
    />
  );

  const renderLegendComponent = () => (
    <View
      style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
      >
        {renderDot("#006DFF")}
        <Text style={{ color: "white" }}>Orders</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {renderDot("#3BE9DE")}
        <Text style={{ color: "white" }}>Remaining</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Select Date Range
        </Text>

        {/* Start Date */}
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          style={{
            padding: 12,
            backgroundColor: theme.primary,
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: "white" }}>
            Start Date: {moment(startDate).format("YYYY-MM-DD")}
          </Text>
        </TouchableOpacity>

        {/* End Date */}
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          style={{
            padding: 12,
            backgroundColor: theme.primary,
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: "white" }}>
            End Date: {moment(endDate).format("YYYY-MM-DD")}
          </Text>
        </TouchableOpacity>

        {/* Fetch Button */}
        <TouchableOpacity
          onPress={handleFetch}
          style={{
            padding: 12,
            backgroundColor: theme.textSecondary,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>{`${
            loading ? "...loading" : "Fetch Orders"
          }`}</Text>
        </TouchableOpacity>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      {/* Pie Chart */}
      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Performance
        </Text>

        <PieChart
          data={pieData}
          donut
          showGradient
          sectionAutoFocus
          radius={90}
          innerRadius={60}
          innerCircleColor={"#232B5D"}
          centerLabelComponent={() => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text
                style={{ fontSize: 22, color: "white", fontWeight: "bold" }}
              >
                {data?.orders?.totalCount || 47}
              </Text>
              <Text style={{ fontSize: 14, color: "white" }}>Orders</Text>
            </View>
          )}
        />

        {renderLegendComponent()}
      </View>
    </View>
  );
};

export default React.memo(PerformanceChart);
