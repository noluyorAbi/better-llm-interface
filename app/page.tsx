"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { MessageSquare, History, Image, Sparkles, FolderOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "Core Chat Window",
      description: "Intuitive text input and response area for seamless LLM interactions",
    },
    {
      icon: History,
      title: "Prompt History Panel",
      description: "Quickly access and reuse previous prompts with a single click",
    },
    {
      icon: Image,
      title: "Media Tab",
      description: "View all images, videos, and files attached in your conversations",
    },
    {
      icon: Sparkles,
      title: "Smart Widget Suggestions",
      description: "Context-aware action suggestions like calendar events, maps, and notes",
    },
    {
      icon: FolderOpen,
      title: "Drag & Drop Canvas",
      description: "Organize conversation snippets by dragging them into folders or canvases",
    },
    {
      icon: Zap,
      title: "Personalized Experience",
      description: "Most-used widgets automatically appear at the top of the suggestion bar",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="LLM Interface" variant="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4">
                Bachelor Thesis MVP
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Intelligent LLM
              <span className="block text-primary">Interface</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mb-8 text-lg text-muted-foreground sm:text-xl"
            >
              A modern interface that enhances workflow speed and satisfaction through smart panels,
              widget suggestions, and intuitive organization tools.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Button size="lg" className="text-base" asChild>
                <Link href="/chat">Start Chatting</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Core Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for an enhanced LLM interaction experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="transition-all hover:shadow-md h-full">
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Experience the Future?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Built with modern web technologies and designed for optimal user experience. Connect
              to any LLM API and start organizing your conversations.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-base" asChild>
                <Link href="/chat">Launch Chat Interface</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t bg-muted/30 py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Project Info */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-foreground mb-2">LLM Interface</h3>
              <p className="text-sm text-muted-foreground">Bachelor Thesis MVP</p>
              <p className="text-xs text-muted-foreground mt-2">
                Built with Next.js, shadcn/ui, and Tailwind CSS
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Contact</h3>
              <p className="text-sm font-medium text-foreground mb-1">alperen adatepe</p>
              <p className="text-sm">
                <a
                  href="mailto:adatepe.alperen@campus.lmu.de"
                  className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 hover:underline-offset-2"
                >
                  adatepe.alperen@campus.lmu.de
                </a>
              </p>
            </div>

            {/* Additional Info */}
            <div className="text-center md:text-right">
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-sm text-muted-foreground">
                A modern intelligent LLM interface with smart panels and intuitive organization
                tools.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} LLM Interface. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
