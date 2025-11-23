'use client'

import { motion, useInView } from "framer-motion";
import { Camera, Search, Repeat } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { useRTL } from "@/hooks/use-rtl";
import { useRef } from "react";

const HowItWorks = () => {
  const { t } = useTranslations();
  const { isRTL } = useRTL();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const steps = [
    {
      icon: Camera,
      titleKey: "step1Title",
      descKey: "step1Desc",
    },
    {
      icon: Search,
      titleKey: "step2Title",
      descKey: "step2Desc",
    },
    {
      icon: Repeat,
      titleKey: "step3Title",
      descKey: "step3Desc",
    }
  ];

  // Slower animation variants for professional feel
  const stepVariants = {
    hidden: { 
      opacity: 0, 
      y: 40
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 1.2,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const lineVariants = {
    hidden: { 
      scaleX: 0,
    },
    visible: (i) => ({
      scaleX: 1,
      transition: {
        delay: i * 1.2 + 0.6,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const iconVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 1.2 + 0.3,
        duration: 0.7,
        ease: [0.34, 1.56, 0.64, 1]
      }
    })
  };

  return (
    <section ref={sectionRef} className="py-32 relative overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className={`text-center max-w-2xl mx-auto mb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              {t("howItWorks")}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground"
          >
            {t("howItWorksTitle")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground"
          >
            {t("howItWorksSubtitle")}
          </motion.p>
        </div>

        <div className={`grid md:grid-cols-3 gap-12 lg:gap-16 relative max-w-6xl mx-auto mt-24 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Animated Connecting Lines */}
          {steps.map((step, index) => (
            index < steps.length - 1 && (
              <motion.div 
                key={`line-${index}`}
                custom={index}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={lineVariants}
                className="hidden md:block absolute top-[52px] h-[2px] z-10"
                style={{ 
                  left: isRTL ? 'auto' : `calc(${(index * 33.333) + 16.666}% + 64px)`,
                  right: isRTL ? `calc(${(index * 33.333) + 16.666}% + 64px)` : 'auto',
                  width: `calc(33.333% - 128px)`,
                  transformOrigin: isRTL ? 'right center' : 'left center'
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-300 dark:from-emerald-700 dark:via-green-700 dark:to-emerald-700" />
              </motion.div>
            )
          ))}

          {steps.map((step, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={stepVariants}
              className="relative group"
            >
              {/* Icon Container - Neutral colors */}
              <motion.div
                custom={index}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={iconVariants}
                className="relative mb-10"
              >
                <div 
                  className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-400/60 dark:group-hover:border-emerald-600/60 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                >
                  <step.icon className="w-12 h-12 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300" strokeWidth={2} />
                </div>
              </motion.div>

              {/* Content with RTL support */}
              <div className={`text-center px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
