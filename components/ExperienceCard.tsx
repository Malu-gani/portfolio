import React from "react";
import { motion } from "framer-motion";

type Props = {};

const ExperienceCard = (props: Props) => {
  return (
    <article className="flex flex-col rounded-lg items-center space-y-7 flex-shrink-0 
      w-[300px] md:w[600px] xl:w-[700px] h-[600px] snap-center bg-[#292929] p-10 hover:opacity-100 opacity-40
      transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 cursor-pointer
      transition-pacity overflow-hidden
    ">
      <motion.img
        initial={{
          y: -100,
          opacity: 0,
        }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="w-32 h-32 rounded-full xl:w-[200] xl:h-[200px] object-cover object-center"
        src="https://lh3.googleusercontent.com/a/ACg8ocKSRhIYOeFXPnAzyYfevofH8-x9K00Wt-XSRczKicqYikI=s360-c-no"
      />
      <div className="px-0 md:px-10 ">
        <h4 className="text-4xl font-light">Ceo de tu vieja</h4>
        <p className="font-bold text-2xl mt-1">TU VIEJA</p>
        <div className="flex space-x-2 my-2">
          <img
            className="w-10 h-10 rounded-full"
            src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/themes/2147555239/settings_images/JtVkDltZTK2mluaMg8sq_iyk1c1EnRCigcLHXSNZq_React-basics.png"
            alt="React"
          />
          <img
            className="w-10 h-10 rounded-full"
            src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/themes/2147555239/settings_images/JtVkDltZTK2mluaMg8sq_iyk1c1EnRCigcLHXSNZq_React-basics.png"
            alt="React"
          />
          <img
            className="w-10 h-10 rounded-full"
            src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/themes/2147555239/settings_images/JtVkDltZTK2mluaMg8sq_iyk1c1EnRCigcLHXSNZq_React-basics.png"
            alt="React"
          />
          <img
            className="w-10 h-10 rounded-full"
            src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/themes/2147555239/settings_images/JtVkDltZTK2mluaMg8sq_iyk1c1EnRCigcLHXSNZq_React-basics.png"
            alt="React"
          />
        </div>
        <p className="uppercase py-5 text-gray-300">
          Startet work ... end work ...
        </p>
        <ul className="list-disc space-y-4 ml-5 text-lg">
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
        </ul>
      </div>
    </article>
  );
};

export default ExperienceCard;
