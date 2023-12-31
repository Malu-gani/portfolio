import React from "react";
import { motion } from "framer-motion";
import ExperienceCard from "./ExperienceCard";

type Props = {};

export default function WorkExperience({}: Props) {
  return (
    <div className="flex flex-col space-y-8 items-center justify-center text-center ">
      <h3 className="mt-20 mb-10  uppercase tracking-[20px] text-gray-500 text-2xl ">
        Experience
      </h3>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="h-screen flex relative overflow-hidden flex-col text-lft md:flex-row max-w-full px-10 justify-evenly mx-auto items-center"
      >
        <div className="w-full flex space-x-5 overflow-x-scroll p-10 snap-x snap-mandatory">
          <ExperienceCard />
          <ExperienceCard />
          <ExperienceCard />
          <ExperienceCard />
        </div>
      </motion.div>
    </div>
  );
}
