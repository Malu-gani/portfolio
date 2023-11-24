import { motion } from "framer-motion";
import React from "react";

type Props = {};

export default function About({}: Props) {
  return (
    <div className="flex flex-col space-y-8 items-center justify-center text-center ">
      <h3 className="mt-20 mb-10  uppercase tracking-[20px] text-gray-500 text-2xl ">
        About
      </h3>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="flex flex-col relative text-center md:text-left md:flex-row  px-10 justify-evenly mx-auto items-center"
      >
        <motion.img
          initial={{
            x: -200,
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
          }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          src="https://lh3.googleusercontent.com/a/ACg8ocKSRhIYOeFXPnAzyYfevofH8-x9K00Wt-XSRczKicqYikI=s360-c-no"
          alt=""
          className="mb-10 md:mb-0 flex-srhink-0 w-56 h-56 rounded-full object-cover md:rounded-lg md:w-64 md:h-95 xl:w-[300px] xl:h-[400px]"
        />

        <div className="space-y-10 px-0 md:px-10">
          <h4 className="text-4xl front-semibold">
            Here is a{" "}
            <span className="underline decoration-[#F7AB0A]">little</span>{" "}
            background
          </h4>
          <p className="text-lg">
            I'm a 20 years old software engineer from Argentina. I'm currently
            working as a freelancer and looking for a job as a software
            engineer. <span className="underline decoration-[#F7AB0A]">I love</span> to
            learn new things and I'm always looking for new challenges
            I'm a very curious person, I like to know how things work and I
            always try to understand the "why" of things. I'm a very{" "}
            <span className="underline decoration-[#F7AB0A]">self-taught</span> person, I like to learn new things and I'm always
            looking for new challenges.
          </p>
        </div>
      </motion.div>
    </div>
  );
}