import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Example component showing Tailwind CSS usage
 * This demonstrates how to use Tailwind classes in React Native
 */
export default function TailwindExample() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header Card */}
      <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 m-4">
        <View className="flex-row items-center mb-4">
          <View className="bg-blue-500 rounded-full p-3 mr-4">
            <Ionicons name="sparkles" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Tailwind CSS
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mt-1">
              NativeWind Example
            </Text>
          </View>
        </View>
      </View>

      {/* Button Examples */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Button Styles
        </Text>
        
        <TouchableOpacity className="bg-blue-600 active:bg-blue-700 rounded-lg px-6 py-3 mb-3 items-center">
          <Text className="text-white font-semibold text-base">
            Primary Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-600 active:bg-gray-700 rounded-lg px-6 py-3 mb-3 items-center">
          <Text className="text-white font-semibold text-base">
            Secondary Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="border-2 border-blue-600 rounded-lg px-6 py-3 items-center">
          <Text className="text-blue-600 font-semibold text-base">
            Outline Button
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Grid */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Card Grid
        </Text>
        
        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <Ionicons name="home" size={32} color="#3B82F6" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-2">
                Home
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Main screen
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <Ionicons name="bookmark" size={32} color="#10B981" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-2">
                Bookmarks
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Saved items
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <Ionicons name="settings" size={32} color="#F59E0B" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-2">
                Settings
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                App preferences
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <Ionicons name="person" size={32} color="#EF4444" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-2">
                Profile
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                User account
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Badge Examples */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Badges
        </Text>
        
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1">
            <Text className="text-blue-800 dark:text-blue-200 text-sm font-medium">
              New
            </Text>
          </View>
          <View className="bg-green-100 dark:bg-green-900 rounded-full px-3 py-1">
            <Text className="text-green-800 dark:text-green-200 text-sm font-medium">
              Active
            </Text>
          </View>
          <View className="bg-yellow-100 dark:bg-yellow-900 rounded-full px-3 py-1">
            <Text className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
              Pending
            </Text>
          </View>
          <View className="bg-red-100 dark:bg-red-900 rounded-full px-3 py-1">
            <Text className="text-red-800 dark:text-red-200 text-sm font-medium">
              Urgent
            </Text>
          </View>
        </View>
      </View>

      {/* Spacing Examples */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Spacing & Layout
        </Text>
        
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-700 dark:text-gray-300">Flex Row</Text>
            <View className="flex-row gap-2">
              <View className="w-4 h-4 bg-blue-500 rounded" />
              <View className="w-4 h-4 bg-green-500 rounded" />
              <View className="w-4 h-4 bg-red-500 rounded" />
            </View>
          </View>
          
          <View className="flex-col gap-2">
            <View className="h-2 bg-gray-300 dark:bg-gray-600 rounded" />
            <View className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <View className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

