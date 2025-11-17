'use client'

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/animations";
import { useSmoothScroll } from "@/hooks/use-scroll-animation";
import { useTranslations } from "@/lib/use-translations";
import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const { scrollToSection } = useSmoothScroll();
  const { t } = useTranslations();

  // Grid positions stay fixed
  const gridPositions = [
    "col-span-4 row-span-2", // Position 0 (large top-left)
    "col-span-2 row-span-2", // Position 1 (small top-right)
    "col-span-2 row-span-2", // Position 2 (small bottom-left)
    "col-span-4 row-span-2"  // Position 3 (large bottom-right)
  ];

  const initialItems = [
    {
      src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Electronics",
      category: "Electronics",
    },
    {
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Fashion",
      category: "Fashion",
    },
    {
      src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Tools",
      category: "Tools",
    },
    {
      src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Audio",
      category: "Audio",
    }
  ];

  const [items, setItems] = useState(initialItems);
  const [currentSwap, setCurrentSwap] = useState(null);

  const swapSequence = [
    { indices: [0, 1], label: "1↔2" },  // Position 1 ↔ Position 2
    { indices: [1, 3], label: "2↔4" },  // Position 2 ↔ Position 4
    { indices: [3, 2], label: "4↔3" },  // Position 4 ↔ Position 3
    { indices: [2, 0], label: "3↔1" }   // Position 3 ↔ Position 1
  ];

  useEffect(() => {
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      const currentStep = swapSequence[stepIndex];
      setCurrentSwap(currentStep.indices);
      
      setItems(prev => {
        const swapped = [...prev];
        const [idx1, idx2] = currentStep.indices;
        [swapped[idx1], swapped[idx2]] = [swapped[idx2], swapped[idx1]];
        return swapped;
      });

      // Clear swap indicator after animation
      setTimeout(() => setCurrentSwap(null), 600);
      
      stepIndex = (stepIndex + 1) % swapSequence.length;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return ( 
    <section className="relative overflow-hidden min-h-screen flex items-center py-20">
      {/* Gradient shapes */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/10 to-transparent dark:from-primary/15 dark:to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary/8 to-transparent dark:from-secondary/12 dark:to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Content Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-10 text-center lg:text-start rtl:lg:text-start"
            >
              {/* Brand Badge */}
                <motion.div
                variants={fadeIn("up", 0.1)}
                className="flex justify-center lg:justify-start rtl:lg:justify-end"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 backdrop-blur-sm"
                >
                  <Image
                    src="/logo.png"
                    alt="Swibba"
                    width={80}
                    height={32}
                    className="h-6 w-auto object-contain"
                  />
                </motion.div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-6">
                <motion.h1 
                  variants={fadeIn("up", 0.2)}
                  className="text-5xl sm:text-6xl lg:text-6xl font-bold leading-tight tracking-tight"
                >
                  <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 dark:from-foreground dark:via-foreground dark:to-foreground/90 bg-clip-text text-transparent">
                    {t("swibbaSlogan")}
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeIn("up", 0.3)}
                  className="text-xl sm:text-2xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto lg:mx-0 rtl:lg:mx-0 leading-relaxed font-light"
                >
                  {t("swibbaDescription")}
                </motion.p>
              </div>

              {/* CTA Section */}
              <motion.div
                variants={fadeIn("up", 0.4)}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start rtl:lg:justify-start pt-4"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground px-8 py-7 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/25"
                  onClick={() => scrollToSection("items")}
                >
                  <span className="flex items-center gap-3 relative z-10">
                    {t("browseItems")}
                    <motion.div
                      animate={{ 
                        x: [0, 5, 0],
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="w-5 h-5 ltr:inline rtl:hidden" />
                      <ArrowRight className="w-5 h-5 ltr:hidden rtl:inline rotate-180" />
                    </motion.div>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </Button>
              </motion.div>
            </motion.div>

            {/* Visual Section - Modern Bento Grid with Swap Animation */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="grid grid-cols-6 grid-rows-4 gap-4 h-[600px]">
                {items.map((item, index) => {
                  const isSwapping = currentSwap?.includes(index);
                  
                  return (
                    <motion.div
                      key={item.category}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isSwapping ? 1.02 : 1
                      }}
                      transition={{ 
                        layout: { 
                          duration: 0.8, 
                          ease: [0.4, 0, 0.2, 1],
                          type: "spring",
                          stiffness: 100,
                          damping: 20
                        },
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.3 }
                      }}
                      className={`${gridPositions[index]} group relative rounded-3xl overflow-hidden bg-card dark:bg-card shadow-xl hover:shadow-2xl transition-shadow duration-500 cursor-pointer ${
                        isSwapping ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background' : ''
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-black/80 dark:via-black/30 group-hover:from-black/60 transition-all duration-500" />
                        
                        {/* Swap Icon Indicator */}
                        <AnimatePresence>
                          {isSwapping && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                              animate={{ opacity: 1, scale: 1, rotate: 180 }}
                              exit={{ opacity: 0, scale: 0.5, rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="absolute top-4 ltr:right-4 rtl:left-4 bg-primary/90 rounded-full p-3 shadow-lg"
                            >
                              <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div 
                          layout
                          className="absolute bottom-6 ltr:left-6 rtl:right-6 transform transition-transform duration-500 group-hover:translate-y-[-4px]"
                        >
                          <p className="text-white font-bold text-xl drop-shadow-2xl">
                            {item.category}
                          </p>
                        </motion.div>
                        {/* Accent border on hover */}
                        <div className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;