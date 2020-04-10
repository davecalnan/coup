module.exports = {
  theme: {
    extend: {
      width: {
        "max-content": "max-content",
        "min-content": "min-content",
        "fit-content": "fit-content",
      },
    },
  },
  variants: {
    zIndex: ["responsive", "hover"],
  },
  plugins: [require("@tailwindcss/ui")],
};
