import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { account } from "../../src/services/appwrite";
import KeyboardSpacer from "../../src/components/KeyboardSpacer";

export default function LoginScreen() {
  const { login } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    account.get().then((user: any) => {
      if (user.email) {
        router.replace("/(tabs)");
      } else {
        setInitializing(false);
      }
    }).catch(() => {
      setInitializing(false);
    });
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Check your credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center" keyboardShouldPersistTaps="handled">
        <View className="p-6">
        <Text className="mb-2 text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="mb-8 text-gray-500">Sign in to your account</Text>

        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="rounded-lg bg-blue-600 py-3"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center font-semibold text-white">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-4">
          <Text className="text-center text-sm text-blue-600">
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      <KeyboardSpacer />
    </View>
  );
}
