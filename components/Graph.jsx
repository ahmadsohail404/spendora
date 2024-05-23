import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { PieChart } from "react-native-chart-kit";
// import useAppwrite from "../lib/useAppwrite";
// import { getAllExpenses } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";

const Graph = ({expenses}) => {
  const { user } = useGlobalContext();
  // const { data: expenses, refetch: refetchExpenses } = useAppwrite(() => getAllExpenses(user.$id));

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const groupedData = expenses.reduce((acc, expense) => {
      const index = acc.findIndex(item => item.name === expense.category);
      if (index > -1) {
        acc[index].amount += parseFloat(expense.amount);
      } else {
        acc.push({
          name: expense.category,
          amount: parseFloat(expense.amount),
          color: getRandomColor(),
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        });
      }
      return acc;
    }, []);
    setChartData(groupedData);
  }, [expenses]);

  const getRandomColor = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };

  return (
    <ScrollView horizontal style={{ paddingHorizontal: 10, paddingVertical: 0 }}>
      <PieChart
        data={chartData.map(item => ({
          name: item.name,
          population: item.amount,
          color: item.color,
          legendFontColor: item.legendFontColor,
          legendFontSize: item.legendFontSize
        }))}
        width={Dimensions.get("window").width - 40} // from react-native
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        center={[0, 0]}
        absolute
      />
    </ScrollView>
  );
};

export default Graph;
