import React from "react";
import { Cursor, useTypewriter } from "react-simple-typewriter";
import BackgroundCircles from "./BackgroundCircles";
import Link from "next/link";

type Props = {};

export default function Hero({}: Props) {
  const [text, count] = useTypewriter({
    words: [
      "Hi, My Name's Maximiliano Emmanuel Dumont",
      "Guy-who-loves-porno.tsx",
      "<ButLovesCodeMore />",
    ],
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <div className="h-screen flex flex-col space-y-8 items-center justify-center text-center overflow-hidden">
      <BackgroundCircles />
      <img
        className="relative rounded-full h-32 w-32 mx-auto object-cover "
        src="https://lh3.googleusercontent.com/a/ACg8ocKSRhIYOeFXPnAzyYfevofH8-x9K00Wt-XSRczKicqYikI=s360-c-no"
        alt=""
      />
      <div className="z-20">
        <h2 className="text-sm uppercase text-gray-500 pb-2 tracking-[15px] ">
          Software Enginer
        </h2>
        <h1 className="text-5xl lg:text-6xl front-semibold px-10">
          <span className="mr-3">{text}</span>
          <Cursor cursorColor="#F7AB0A" />
        </h1>

        <div className="pt-5">
          <Link href="@about">
          <button className="heroButton">  About</button>
          </Link>
          <Link href="@experience">
          <button className="heroButton">  Experience</button>
          </Link>
          <Link href="@skills">
          <button className="heroButton">  Skills</button>
          </Link>
          <Link href="@porjects">
          <button className="heroButton">  Porjects</button>
          </Link>
        </div>
      </div>


    </div>
  );
}
