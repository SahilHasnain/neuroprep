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
        variant === "primary" && "bg-blue-500",
        variant === "secondary" && "bg-gray-200",
        variant === "outline" && "bg-white border-[1.5px] border-blue-500",
        (disabled || loading) && "opacity-50", className
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#3b82f6"}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={clsx(
              "text-base font-semibold",
              variant === "primary" && "text-white",
              variant === "secondary" && "text-gray-900",
              variant === "outline" && "text-blue-500",
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
