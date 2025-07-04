import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import AboutComp from "../components/AboutComp";
import TopBar from "../components/TopBar";
import WhatsappButton from "../components/WhatsappButton";

export default function AboutPage() {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
    <TopBar />

      <Navbar />
      <AboutComp /> 
      <WhatsappButton />
    </motion.div>
  );
}