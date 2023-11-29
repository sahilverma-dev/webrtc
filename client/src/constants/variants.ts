import { Variants } from "framer-motion";

export const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.05,
    },
  },
};

export const item: Variants = {
  hidden: {
    x: 50,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
};
