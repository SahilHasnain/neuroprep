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
import { useModalVisibility } from "@/hooks/useModalVisibility";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

// Real Appwrite authentication with signup/login toggle
export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const { login, signup } = useAuthStore();
  useModalVisibility("auth-modal", visible);
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
      <View className="justify-end flex-1 bg-black/85">
        <ScrollView
          className="p-6 bg-dark-bg-secondary rounded-t-2xl max-h-3/4"
          scrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Header with close button */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-text-primary">
              {isSignUp ? "Create Account" : "Login"}
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Text className="text-2xl text-text-tertiary">✕</Text>
            </Pressable>
          </View>

          {/* Toggle buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => isSignUp && handleToggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                !isSignUp
                  ? "bg-gradient-to-r from-accent-blue to-accent-purple border-accent-blue"
                  : "bg-transparent border-dark-surface-300"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  !isSignUp ? "text-white" : "text-text-tertiary"
                }`}
              >
                Login
              </Text>
            </Pressable>
            <Pressable
              onPress={() => !isSignUp && handleToggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                isSignUp
                  ? "bg-gradient-to-r from-accent-blue to-accent-purple border-accent-blue"
                  : "bg-transparent border-dark-surface-300"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  isSignUp ? "text-white" : "text-text-tertiary"
                }`}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Error message */}
          {error && (
            <View className="p-3 mb-4 border border-error-border rounded-lg bg-error-bg">
              <Text className="text-sm text-error-text">{error}</Text>
            </View>
          )}

          {/* Name input (signup only) */}
          {isSignUp && (
            <>
              <Text className="mb-2 text-sm font-semibold text-text-secondary">
                Full Name
              </Text>
              <TextInput
                placeholder="Umair Farhat"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
                className="w-full px-4 py-3 mb-4 bg-dark-surface-100 border border-dark-surface-300 rounded-lg text-text-secondary"
              />
            </>
          )}

          {/* Email input */}
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Email
          </Text>
          <TextInput
            placeholder="your@gmail.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            className="w-full px-4 py-3 mb-4 bg-dark-surface-100 border border-dark-surface-300 rounded-lg text-text-secondary"
          />

          {/* Password input */}
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Password
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            className="w-full px-4 py-3 mb-4 bg-dark-surface-100 border border-dark-surface-300 rounded-lg text-text-secondary"
          />

          {/* Confirm password (signup only) */}
          {isSignUp && (
            <>
              <Text className="mb-2 text-sm font-semibold text-text-secondary">
                Confirm Password
              </Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
                className="w-full px-4 py-3 mb-6 bg-dark-surface-100 border border-dark-surface-300 rounded-lg text-text-secondary"
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
          <Text className="text-xs text-center text-text-tertiary">
            {isSignUp
              ? "By signing up, you agree to our terms"
              : "Login to unlock unlimited Ask Doubt, Questions, and Notes"}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
