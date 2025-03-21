"use client";

import { Logo } from "@/components/Logo";
import { FloatingHeader } from "@/components/FloatingHeader";
import { AnimatedButton } from "@/components/AnimatedButton";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  return (
    <div className="dark bg-dark-300 min-h-screen">
      <FloatingHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-4 flex flex-col items-center justify-center overflow-hidden hero-pattern">
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(46, 189, 67, 0.1) 0%, transparent 70%)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="container px-4 py-12 md:py-24 flex flex-col items-center text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 inline-block px-3 py-1 rounded-full bg-electric-900/30 border border-electric-500/20 text-electric-400 text-sm font-medium"
          >
            cursor.ninja
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Cursor Rules <span className="text-electric-500">Made</span> Easy{" "}
            <span className="relative inline-block">
              <motion.span
                className="absolute -right-8 -top-8"
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: [0, -10, 0], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span role="img" aria-label="ninja" className="text-3xl">
                  🥷
                </span>
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            generate cursor rules with AI, make cursor smarter.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Dialog>
              <DialogTrigger asChild>
            <Button
              size="lg"
              variant="ghost"
              className="bg-electric-500 text-muted-foreground font-medium"
            >
              Watch Demo
            </Button>

              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Watch Demo
                  </DialogTitle>
                  <DialogDescription>
                    Watch a demo of the app in action.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-lg text-gray-400 flex w-full justify-center flex-col items-center gap-4">
                  <p>
                    Demo coming soon!
                  </p>
                  <Link href="/app">
                    <p className="text-amber-400 hover:text-amber-500">
                      Click to try it now!
                    </p>
                  </Link>
                </div>
                <DialogFooter>
                  <Button>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link href="/app">
              <AnimatedButton
                size="lg"
                variant="outline"
                className="border-white/10 text-gray-300 hover:text-electric-400 hover:border-electric-500/50 bg-transparent"
                glowColor="rgba(255, 255, 255, 0.1)"
              >
                Try it out
              </AnimatedButton>
            </Link>
          </motion.div>

          <motion.div
            className="relative w-full max-w-4xl mx-auto mt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="window-frame rounded-lg overflow-hidden border border-dark-100/30 shadow-2xl shadow-black/50">
              <div className="window-header bg-dark-400 flex items-center px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-gray-400">
                  cursor-rules.cursorrule
                </div>
              </div>
              <div className="code-content bg-dark-500 text-gray-300 p-6 font-mono text-sm overflow-hidden relative">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <pre>
                    <span className="text-blue-400">This project follows the</span>{" "}
                    <span className="text-electric-400">React Best Practices</span>{" "}
                    <span className="text-blue-400">for our team.</span>
                  </pre>
                  <pre className="mt-4">
                    <span className="text-yellow-300">Technologies:</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">-</span>{" "}
                    <span className="text-purple-400">React 18+ with TypeScript</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">-</span>{" "}
                    <span className="text-purple-400">Next.js for server components and routing</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">-</span>{" "}
                    <span className="text-purple-400">TailwindCSS for styling</span>
                  </pre>
                  <pre className="mt-4">
                    <span className="text-yellow-300">Coding Standards:</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">1.</span>{" "}
                    <span className="text-orange-400">Use functional components with hooks</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">2.</span>{" "}
                    <span className="text-orange-400">Prefer named exports over default exports</span>
                  </pre>
                  <pre>
                    <span className="text-gray-400">3.</span>{" "}
                    <span className="text-orange-400">Use TypeScript interfaces for props and state</span>
                  </pre>
                </motion.div>

                <motion.div
                  className="absolute bottom-2 right-2 text-electric-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                >
                  <span role="img" aria-label="ninja">
                    🥷
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <motion.div
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-electric-500/20 backdrop-blur-md"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-electric-500/30 backdrop-blur-md"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.div
            className="mt-12 text-gray-400 text-sm max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <p>
              Create, manage, and share coding standards and best practices through 
              our visual node-based editor. Perfect for teams that want consistent codebases. Defining rules for AI should be fun.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - updated version */}
      <footer className="bg-dark-400/50 backdrop-blur-md border-t border-dark-100/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Logo size="sm" />
              <span className="text-sm text-gray-500 ml-4">
                © 2025 Cursor Ninja. All rights reserved.
              </span>
            </motion.div>

            <motion.div
              className="flex space-x-8 mt-6 md:mt-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.a
                href="https://github.com/mandrillxx/cursor-ninja"
                className="text-sm text-gray-400 hover:text-electric-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                GitHub
              </motion.a>
              <motion.a
                href="https://x.com/xeno_mouse"
                className="text-sm text-gray-400 hover:text-electric-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Contact
              </motion.a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
