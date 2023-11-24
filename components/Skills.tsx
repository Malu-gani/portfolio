import React from 'react'
import { motion } from 'framer-motion'
import Skill from './skill'

type Props = {}

function Skills({}: Props) {
  return (
    <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
    className="flex flex-col space-y-8 items-center justify-center text-center "
  >

      <h3 className="mt-20 mb-10  uppercase tracking-[20px] text-gray-500 text-2xl ">
        Skills
      </h3>
      <h3 className=" uppercase tracking-[10px] text-gray-500  ">
            Hover over the skills to see more info
        </h3>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="h-screen top-20 flex-col relative text-center md:text-left md:flex-row  max-w-[2000] xl:px-10 min-h-screen 
        justify-center xl:space-y-0 mx-auto items-center"
      >
        <div className='grid grid-cols-4 gap-5'>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
            <Skill/>
        </div>
       
    
      </motion.div>
    </motion.div>
  )
}

export default Skills