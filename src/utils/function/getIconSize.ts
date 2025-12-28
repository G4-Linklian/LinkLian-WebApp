// utils/getIconSize.ts
export const getIconSize = () => {
  if (typeof window === "undefined") return 24;

  if (window.innerWidth < 640) return 18;   // mobile
  if (window.innerWidth < 1024) return 22;  // tablet
  return 26;                                // desktop
};
