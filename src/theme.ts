import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#e8f4ff",
    60: "#E2EBF3",
    100: "#c5e0f7",
    200: "#9fcbed",
    300: "#79b5e3",
    400: "#5ca4dc",
    450: "#2D547B",
    460: "#244869",
    500: "#01008c",
    600: "#1a3355",
    700: "#162b4a",
    800: "#12233f",
    900: "#0e1b33",
  },
  accent: {
    green: "#00C496",
    greenHover: "#008F6B",
  },
  error: {
    500: "#EF4444",
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
  breakpoints: {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    xxl: "90em", // 1440px
    "2xl": "96em",
  },
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
      baseStyle: {
        fontWeight: "600",
        minW: "10",
        minH: "10",
        borderRadius: "xl",
        h: "auto",
        maxH: "unset",
        maxW: "360px",
        py: 2.5,
        px: 4,
        _disabled: { opacity: 0.5, pointerEvents: "none" },
      },
      variants: {
        primary: {
          bg: "brand.450",
          color: "white",
          _hover: { bg: "brand.460" },
        },
        secondary: {
          bg: "white",
          color: "brand.500",
          borderWidth: "1px",
          borderColor: "brand.500",
          _hover: { bg: "lavender.50" },
        },
        outline: {
          outline: "1px solid brand.450",
          color: "brand.450",
          bg: "transparent",
          _hover: { bg: "brand.60" },
        },
        accent: {
          bg: "accent.green",
          _hover: { bg: "accent.greenHover" },
        },
      },
      sizes: {
        xl: { fontSize: "xl", py: 3, px: 6 },
        lg: { fontSize: "lg", px: 5 },
        md: { fontSize: "md", px: 4, lineHeight: 5 },
      },
      defaultProps: {
        variant: "primary",
        size: "md",
        colorScheme: "brand",
      },
    },
    Input: {
      variants: {
        custom: {
          field: {
            bg: "gray.50",
            borderWidth: "1px",
            borderColor: "gray.200",
            borderRadius: "10px",
            fontSize: "md",
            h: "44px",
            _placeholder: { color: "gray.400" },
          },
        },
      },
    },
    Textarea: {
      variants: {
        custom: {
          bg: "gray.50",
          borderWidth: "1px",
          borderColor: "gray.200",
          borderRadius: "10px",
          fontSize: "md",
          py: 2.5,
          _placeholder: { color: "gray.400" },
        },
      },
    },
  },
});

export default theme;
