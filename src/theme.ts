import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#e8f4ff",
    100: "#c5e0f7",
    200: "#9fcbed",
    300: "#79b5e3",
    400: "#5ca4dc",
    500: "#01008c",
    600: "#1a3355",
    700: "#162b4a",
    800: "#12233f",
    900: "#0e1b33",
  },
  accent: {
    green: "#10f48a",
    greenHover: "#0ed978",
  },
  lavender: {
    50: "#dcd5fe",
    100: "#e8e2f2",
    200: "#d4c9e8",
    300: "#b8a8d9",
    400: "#9d87ca",
  },
};

const theme = extendTheme({
  colors,
  fonts: {
    heading: '"DM Sans", system-ui, sans-serif',
    body: '"DM Sans", system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: "#F2F2F2",
        color: "brand.800",
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: "brand.500",
          color: "white",
          _hover: { bg: "brand.600" },
        },
        secondary: {
          bg: "white",
          color: "brand.500",
          borderWidth: "1px",
          borderColor: "brand.500",
          _hover: { bg: "lavender.50" },
        },
      },
    },
  },
});

export default theme;
