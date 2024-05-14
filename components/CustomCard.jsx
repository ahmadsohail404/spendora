import { View, Text, TouchableOpacity, Image } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons/faMoneyCheckDollar'
import { useGlobalContext } from '../context/GlobalProvider'

const CustomCard = () => {
  const { getMoney, payMoney } = useGlobalContext()

  const total = getMoney - payMoney

  return (
    <View className="bg-secondary rounded-xl m-4 p-4 flex-row justify-between items-center">
      <View className="flex-2">
        <View className="mb-7">
          <Text className="text-black-300 font-pmedium text-lg">
            Total Balance: {" "}
            <Text className={total > 0 ? "text-green-600" : "text-red-500"} >₹ {total}</Text>
          </Text>
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-green-600 font-pmedium">
              ₹ 200
            </Text>
            <Text className="text-black-300 font-pmedium">
              will get
            </Text>
          </View>
          <View>
            <Text className="text-red-500 font-pmedium">
              ₹ 100
            </Text>
            <Text className="text-black-300 font-pmedium">
              will pay
            </Text>
          </View>
        </View>
      </View>
      <View className="h-full bg-black-200 w-[1px]" ></View>
      <TouchableOpacity activeOpacity={0.7} className="flex justify-center items-center">
        {total < 0 ? (
          <>
            <FontAwesomeIcon icon={faMoneyCheckDollar} color={'red'} size={32} />
            <Text className="text-red-500 font-psemibold mt-1">
              You will pay
            </Text>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faMoneyCheckDollar} color={'green'} size={32} />
            <Text className="text-black-300 font-psemibold mt-1">
              You will get
            </Text>
          </>
        )
        }
      </TouchableOpacity>
    </View>

  )
}

export default CustomCard