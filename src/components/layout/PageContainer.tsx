import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export function PageContainer({ children, className, maxWidth = "lg" }: PageContainerProps) {
  return (
    <main className={cn("container flex-1 py-8", maxWidthClasses[maxWidth], className)}>
      {children}
    </main>
  );
}
