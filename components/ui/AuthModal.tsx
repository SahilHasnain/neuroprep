import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
} from "react-native";
import Button from "./Button";
import { useAuthStore } from "@/store/authStore";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

// Real Appwrite authentication with signup/login toggle
export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const { login, signup } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError(null);
  };

  const handleToggleMode = () => {
    resetForm();
    setIsSignUp(!isSignUp);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuth = async () => {
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Please enter email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, name);
        Alert.alert("Success", "Account created successfully!");
      } else {
        await login(email, password);
      }
      resetForm();
      setIsSignUp(false);
      onClose();
    } catch (err: any) {
      setError(err.message || (isSignUp ? "Sign up failed" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="justify-end flex-1 bg-black/50">
        <ScrollView
          className="p-6 bg-white rounded-t-2xl max-h-3/4"
          scrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Header with close button */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Login"}
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Text className="text-2xl">✕</Text>
            </Pressable>
          </View>

          {/* Toggle buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => !isSignUp && handleToggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                !isSignUp
                  ? "bg-blue-600 border-blue-600"
                  : "bg-transparent border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  !isSignUp ? "text-white" : "text-gray-600"
                }`}
              >
                Login
              </Text>
            </Pressable>
            <Pressable
              onPress={() => isSignUp && handleToggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                isSignUp
                  ? "bg-blue-600 border-blue-600"
                  : "bg-transparent border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  isSignUp ? "text-white" : "text-gray-600"
                }`}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Error message */}
          {error && (
            <View className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          )}

          {/* Name input (signup only) */}
          {isSignUp && (
            <>
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Full Name
              </Text>
              <TextInput
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
                className="w-full px-4 py-3 mb-4 bg-white border border-gray-300 rounded-lg"
              />
            </>
          )}

          {/* Email input */}
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Email
          </Text>
          <TextInput
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            className="w-full px-4 py-3 mb-4 bg-white border border-gray-300 rounded-lg"
          />

          {/* Password input */}
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Password
          </Text>
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            className="w-full px-4 py-3 mb-4 bg-white border border-gray-300 rounded-lg"
          />

          {/* Confirm password (signup only) */}
          {isSignUp && (
            <>
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Confirm Password
              </Text>
              <TextInput
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
                className="w-full px-4 py-3 mb-6 bg-white border border-gray-300 rounded-lg"
              />
            </>
          )}

          {/* Submit button */}
          <Button
            title={
              loading ? "Processing..." : isSignUp ? "Create Account" : "Login"
            }
            onPress={handleAuth}
            disabled={loading}
            className={`mb-6 ${loading ? "opacity-60" : ""}`}
          />

          {/* Info text */}
          <Text className="text-xs text-center text-gray-500">
            {isSignUp
              ? "By signing up, you agree to our terms"
              : "Login to unlock unlimited Ask Doubt, Questions, and Notes"}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
