"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function FloatingHeader() {
  return (
    <motion.nav
      className="fixed left-[50%] top-8 flex w-fit -translate-x-[50%] items-center gap-12 rounded-full border-[1px] border-neutral-700/50 bg-dark-300/80 backdrop-blur-xl p-4 px-8 text-sm text-neutral-400 z-50 shadow-lg shadow-black/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(100, 100, 255, 0.2)",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Link href="/">
          <Logo size="sm" />
        </Link>
      </motion.div>

      <motion.div
        className="flex items-center gap-6"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {[
          {
            title: "GitHub",
            href: "https://github.com/mandrillxx/cursor-ninja",
          },
          { title: "Twitter", href: "https://x.com/xeno_mouse" },
        ].map((item) => (
          <motion.div
            key={item.title}
            variants={{
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3 }}
          >
            <NavLink href={item.href}>{item.title}</NavLink>
          </motion.div>
        ))}
      </motion.div>

      <JoinButton />
    </motion.nav>
  );
}

const NavLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <Link href={href} className="block overflow-hidden">
      <motion.div
        whileHover={{ y: -20 }}
        transition={{ ease: "backInOut", duration: 0.5 }}
        className="h-[20px]"
      >
        <span className="flex h-[20px] items-center">{children}</span>
        <span className="flex h-[20px] items-center text-electric-500">
          {children}
        </span>
      </motion.div>
    </Link>
  );
};

const JoinButton = () => {
  return (
    <Link href="/app">
      <motion.button
        className={`
        relative z-0 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border-[1px] 
        border-neutral-700/50 px-4 py-1.5 font-medium
        text-neutral-300 transition-all duration-300
        
        before:absolute before:inset-0
        before:-z-10 before:translate-y-[200%]
        before:scale-[2.5]
        before:rounded-[100%] before:bg-electric-500
        before:transition-transform before:duration-700
        before:content-[""]
        cursor-pointer
        hover:border-electric-500 hover:text-white
        hover:before:translate-y-[0%]
        active:scale-95`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <span>Get Started</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          <path
            d="M1.16663 7H12.8333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 1.16675L12.8333 7.00008L7 12.8334"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </Link>
  );
};
