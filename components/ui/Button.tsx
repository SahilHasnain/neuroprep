import clsx from "clsx";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={clsx(
        "py-3 px-6 rounded-xl items-center justify-center flex-row",
        fullWidth && "w-full",
        variant === "primary" &&
          "bg-gradient-to-r from-accent-blue to-accent-purple",
        variant === "secondary" &&
          "bg-dark-surface-200 border border-dark-surface-300",
        variant === "outline" &&
          "bg-transparent border-[1.5px] border-accent-blue",
        (disabled || loading) && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#60a5fa"}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={clsx(
              "text-base font-semibold",
              variant === "primary" && "text-white",
              variant === "secondary" && "text-text-secondary",
              variant === "outline" && "text-accent-blue-light",
              icon && "ml-2"
            )}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
