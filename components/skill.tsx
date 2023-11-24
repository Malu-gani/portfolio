import React from 'react'
import { motion } from 'framer-motion'

type Props = {
    directionLeft?: boolean
}

function skill({directionLeft}: Props) {
  return (
    <div className='group relative flex cursor-pointer'>
        <motion.img
            initial={{ 
                x: directionLeft ? -200 : 200,
                opacity: 0,
            }}
            transition={{ duration: 1}}
            whileInView={{opacity: 1, x: 0}}
            src='https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'
            className='rounded-full border border-gay-500 object-cover w-16 h-16 md:w-20 md:h-20 xl:w-24 xl:h-24 filter 
            group-hover:grayscale transition duration-300 ease-in-out'
        >
        </motion.img>
        <div
        className="absolute opacity-0 group-hover:opacity-80 transition duration-300 ease-in-out g
     group-hover:bg-white h-16 w-16 md:w-20 md:h-20 xl:w-24 xl:h-24 rounded-full z-0"
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-3xl font-bold text-black opacity-100">100%</p>
        </div>
        </div>


    </div>
  )
}

export default skill