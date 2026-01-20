import "dotenv/config";
import mongoose from "mongoose";
import { Path, Module, PathModule } from "../lib/models";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pathsData = [
  {
    title: "HTML Tutorials for Beginners",
    description:
      "HTML for Beginners Course. This full course is where you should begin your journey towards learning web development. Learn HTML basics before you attempt to learn CSS or JavaScript. HTML is the foundation and starting point for everything else you add in web development.",
    image:
      "https://i.ytimg.com/vi/P0EGYTb1cBs/hqdefault.jpg?sqp=-oaymwEXCOADEI4CSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDThjJ1gfvS12ZVrrzvmI6wGbzFFw",
    modules: [
      {
        video_id: "P0EGYTb1cBs",
        title: "Introduction to HTML | An HTML5 Tutorial for Beginners",
      },
      {
        video_id: "QRvA8Mp-uME",
        title: "Head Tag in HTML | An HTML5 Head Element Tutorial",
      },
      {
        video_id: "tC56TakOjIE",
        title: "HTML Tag Text Basics | HTML5 Element Text Tutorial",
      },
      {
        video_id: "gJWNA3Fduek",
        title:
          "HTML Lists Tutorial | HTML5 List Types: Ordered, Unordered & Description",
      },
      {
        video_id: "iMj-TbN7ydg",
        title: "How to Add Links in HTML code | HTML5 Linking Tutorial",
      },
      {
        video_id: "0pBAfkZMKy0",
        title: "How to Insert Images in HTML | An HTML5 Image Tutorial",
      },
      {
        video_id: "kX3TfdUqpuU",
        title: "Semantic HTML Tags | HTML5 Semantic Elements Tutorial",
      },
      {
        video_id: "e23RA_Uo99o",
        title: "How to Create Tables in HTML | HTML5 Table Tutorial",
      },
      {
        video_id: "frAGrGN00OA",
        title: "HTML Forms and Inputs | HTML5 Tutorial for Beginners",
      },
      {
        video_id: "T5PD8ofhiug",
        title:
          "HTML5 Website Project for Beginners | First HTML Project Tutorial",
      },
      {
        video_id: "mJgBOIoGihA",
        title: "HTML Full Course for Beginners | Complete All-in-One Tutorial",
      },
    ],
  },
  {
    title: "React Hooks",
    description:
      "A playlist to cover all of the built-in React.js hooks and custom hook creation. useState, useEffect and useContext tutorials are found in my React.js Full Course for Beginners video.",
    image:
      "https://i.ytimg.com/vi/FB_kOSHk1DM/hqdefault.jpg?sqp=-oaymwEXCOADEI4CSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBhknQUJT2dXEZ-j4ufYPC2GcECsA",
    modules: [
      {
        video_id: "FB_kOSHk1DM",
        title:
          "useCallback STOPS this React MISTAKE | useCallback React Hooks Tutorial",
      },
      {
        video_id: "oR8gUi1LfWY",
        title: "useMemo Explained | React Hooks useMemo Tutorial",
      },
      {
        video_id: "s6UAuFzL308",
        title: "BUILD a React Timer with useRef | React Hooks useRef Tutorial",
      },
      {
        video_id: "26ogBZXeBwc",
        title:
          "useReducer is BETTER than useState | React Hook useReducer Tutorial",
      },
      {
        video_id: "pHxQtHwcT-s",
        title: "useLayoutEffect vs useEffect | React Hooks Tutorial",
      },
      {
        video_id: "ZtcgPhWv1e8",
        title:
          "useImperativeHandle Explained with an Example | React Hooks Tutorial",
      },
      {
        video_id: "NoylmJJPF48",
        title: "The Built-in React Hook NO ONE talks about!",
      },
      {
        video_id: "NqdqnfzOQFE",
        title: "Use Axios with React Hooks for Async-Await Requests",
      },
      {
        video_id: "U9Cth5xDEKs",
        title:
          "React v18 Hooks - useTransition vs useDeferredValue Examples & Comparison",
      },
      {
        video_id: "MHm-2YmWEek",
        title: "React Debounce Search Input API Call | useDebounce React Hook",
      },
    ],
  },
  {
    title: "Javascript Tutorials for Beginners",
    description:
      "JavaScript Tutorials for Beginners video series to help you learn and understand the basics of JS.",
    image:
      "https://i.ytimg.com/vi/SajRjc9KKUE/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAbp97MnxVQMZaA8Sz3hhm8qAu6OA",
    modules: [
      {
        video_id: "SajRjc9KKUE",
        title: "JavaScript Tutorial for Beginners: Quick Start",
      },
      {
        video_id: "JMy6z1GricM",
        title:
          "Where do I put my JavaScript? How to link Javascript to HTML | Tutorial for Beginners",
      },
      {
        video_id: "LiuzigJldNo",
        title:
          "JavaScript String Methods and Properties | JavaScript Tutorial for Beginners",
      },
      {
        video_id: "3Ul9gYweEPs",
        title:
          "JavaScript Numbers, Number Methods, isNaN | JavaScript Tutorial for Beginners",
      },
      {
        video_id: "vzLdq3b0w3Y",
        title:
          "Math Methods and How to Generate a Random Number with JavaScript | JavaScript Tutorial for Beginners",
      },
      {
        video_id: "gLt1KJPmjXA",
        title:
          "Problem Solving with Code | Your First Coding Challenge | JavaScript Tutorial for Beginners",
      },
      {
        video_id: "9Ykz2_PhdfE",
        title: "If Statements in Javascript | Tutorial for Beginners",
      },
      {
        video_id: "3q7sk03ehOs",
        title: "Switch Statements in Javascript | Tutorial for Beginners",
      },
      {
        video_id: "ib8MHSMwtYg",
        title: "Ternary Operator in Javascript | Tutorial for Beginners",
      },
      {
        video_id: "94UM0Ss3uoU",
        title: "User Input in Javascript | Tutorial for Beginners",
      },
      {
        video_id: "C2_z34QFVjw",
        title:
          "Your First Javascript Game | Tutorial for Beginners | Rock, Paper, Scissors",
      },
      {
        video_id: "zO5-OnRA5lA",
        title:
          "For Loops, While Loops, Do While Loops | Javascript Loop Tutorial for Beginners",
      },
      {
        video_id: "u_lLNH38n5E",
        title: "Functions in Javascript | Javascript Functions Tutorial",
      },
      {
        video_id: "_E96W6ivHng",
        title:
          "var let const in Javascript Scope | Understanding Global Local Function Block Scope",
      },
      {
        video_id: "0SyTDl4pb4w",
        title: "Arrays in Javascript | Arrays Tutorial for Beginners",
      },
      {
        video_id: "yEYqGiAiLFk",
        title: "Refactoring Code | Rock Paper Scissors | Web Dev | Javascript",
      },
      {
        video_id: "rLPwCAqyCAE",
        title: "Javascript Objects Explained | Javascript Objects Tutorial",
      },
      {
        video_id: "5fmifZZeJJ4",
        title:
          "Javascript Classes Explained | Javascript Factory Functions | es6 private variables properties",
      },
      {
        video_id: "wFJEQB-QxuE",
        title: "JSON Explained with JavaScript | JSON Tutorial for Beginners",
      },
      {
        video_id: "blBoIyNhGvY",
        title:
          "Javascript Error Handling | Handle Errors in Javascript | Try Catch Finally",
      },
      {
        video_id: "WbG86sMd3SU",
        title: "JavaScript DOM Tutorial | Document Object Model in JavaScript",
      },
      {
        video_id: "UVRDq-wnfgk",
        title: "Event Listeners in JavaScript | JavaScript Events Tutorial",
      },
      {
        video_id: "zmFDvFwj6-8",
        title: "JavaScript LocalStorage and Session Storage API Tutorial",
      },
      {
        video_id: "Q3SBogjUfMk",
        title: "Javascript Modules | Export Import Syntax for ES6 Modules",
      },
      {
        video_id: "7BeT6lsudL4",
        title:
          "Higher Order Functions Javascript | forEach, filter, map, and reduce functions",
      },
      {
        video_id: "VmQ6dHvnKIM",
        title:
          "Callbacks, Promises, Async Await | JavaScript Fetch API Explained",
      },
      {
        video_id: "3l08sBKOSCs",
        title: "Regex Tutorial | Regular Expressions Explained",
      },
      {
        video_id: "LAa-mGCx484",
        title: "Regex Javascript | Regular Expressions in JavaScript",
      },
      {
        video_id: "EfAl9bwzVZk",
        title:
          "JavaScript Full Course for Beginners | Complete All-in-One Tutorial",
      },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    for (const pathData of pathsData) {
      console.log(`\nCreating path: ${pathData.title}`);
      const path = await Path.create({
        title: pathData.title,
        description: pathData.description,
        image: pathData.image,
      });
      console.log(`  Path created with ID: ${path._id}`);
      for (let i = 0; i < pathData.modules.length; i++) {
        const moduleData = pathData.modules[i];
        const module = await Module.create({
          title: moduleData.title,
          description: moduleData.title,
          image: "",
          content_type: "youtube_video",
          content: moduleData.video_id,
        });
        await PathModule.create({
          path_id: path._id,
          module_id: module._id,
          order: i + 1,
        });

        console.log(
          `  Module ${i + 1}: ${moduleData.title.substring(0, 50)}...`,
        );
      }

      console.log(`  Total modules: ${pathData.modules.length}`);
    }

    console.log("\nSeed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
