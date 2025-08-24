'use client'

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn,  floatingAnimation, glowEffect } from "@/lib/animations";
import { useSmoothScroll } from "@/hooks/use-scroll-animation";
import { useTranslations } from "@/lib/use-translations"
import Image from "next/image";
 const HeroSection = ()=> {
  const { scrollToSection } = useSmoothScroll();
  const { t } = useTranslations()

  const heroImages = [
    {
      src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Modern laptop workspace",
      category: "Electronics",
      subcategory: "Latest Tech",
      className: "w-64 h-48 top-8 right-16",
      delay: 0,
    },
    {
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=225",
      alt: "Fashion accessories watch",
      category: "Fashion",
      subcategory: "",
      className: "w-48 h-36 top-32 right-2",
      delay: 0.5,
    },
    {
      src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=200",
      alt: "Home tools and hardware",
      category: "Tools",
      subcategory: "",
      className: "w-40 h-32 top-56 right-24",
      delay: 1,
    },
  ];

  return (
    <section className="relative overflow-hidden h-full pb-4 -mt-4 px-2">
      <div className="absolute  inset-0 bg-gradient-to-br from-primary/10 via-background to-[hsl(14,100%,60%)]/20 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary/20" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            variants={fadeIn("up")}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className="space-y-4 ">
              <motion.h1
                variants={fadeIn("up", 0.2)}
                className="text-6xl md:text-6xl font-bold leading-tight "
              >

                {/* <Link href="/" className="flex items-center gap-2"> */}
                {/* <div className="flex h-16 w-32 items-center justify-center bg-transparent -my-3  "> */}
                    <Image
                    dir="ltr"
                    lang="en"
                   src="/hero-section-logo.png"
                   alt="Swibba Logo"
                   width={300}
                    height={80}
                    className="font-bold text-center  animate-pulse-custom  h-28 w-64 cursor-pointer "
                     priority
                     style={{ direction: "rtl" }}
                    />

                  {/* <span className="text-2xl font-black gold-text-gradient">
                  </span> */}
                {/* </div> */}
              {/* </Link> */}
                {/* <span className="gradient-text"> {t("deelDeal")}</span> */}
              </motion.h1>
              <motion.h2
                variants={fadeIn("up", 0.4)}
                className="text-6xl md:text-5xl font-bold text-foreground leading-tight"
              >
             {t("deelDealSlogan")}
              </motion.h2>
              <motion.p
                variants={fadeIn("up", 0.6)}
                className="text-xl text-muted-foreground max-w-lg"
              >
                {t("deelDealDescription")}
              </motion.p>
            </div>

            <motion.div
              variants={fadeIn("up", 0.8)}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                variants={glowEffect}
                animate="animate"
              >
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground px-8 py-4 text-lg font-medium group"
                  onClick={() => scrollToSection("items")}
                >
                  <span className="flex items-center gap-2">
                      {t("browseItems")}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Images */}
          <div className={`relative hidden lg:block -mt-72 lg:mr-32 `}>
            <div className="absolute inset-0 ">
              {heroImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: image.delay,
                    ease: "easeOut",
                  }}
                  className={`absolute ${image.className} rounded-2xl shadow-2xl overflow-hidden group cursor-pointer`}
                >
                  <motion.div
                    variants={floatingAnimation}
                    animate="animate"
                    style={{ animationDelay: `${image.delay}s` }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    className="relative w-full h-full"
                  >
                    <Image 
                      src={image.src}
                      width={100}
                      height={100}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: image.delay + 0.5 }}
                        className="text-sm font-medium"
                      >
                        {image.category}
                      </motion.p>
                      {image.subcategory && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: image.delay + 0.7 }}
                          className="text-xs opacity-80"
                        >
                          {image.subcategory}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 export default  HeroSection;