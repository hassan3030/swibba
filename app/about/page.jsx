"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Award } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import Image from 'next/image';
import { getFounders } from "../../callAPI/static";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-provider";
import { mediaURL } from "@/callAPI/utiles";
const AboutPage = () => {
    const { t } = useTranslations();
  const { isRTL } = useLanguage()

    const [founders, setFounders] = useState([]);
    const getAllFounders = async () => {
      const response = await getFounders();
      if (response.success) {
        setFounders(response.data);
      } else {
        // console.error(response.message);
      }
    };

    useEffect(() => {
      getAllFounders();
    }, []);
  return (
    <>
<div className="container mx-auto py-10 px-4 max-w-6xl">
       <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{t("AboutOurCompany")||"About Our Company"}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
{t("We're dedicated to providing exceptional services and products to our customers around the world")||"We're dedicated to providing exceptional services and products to our customers around the world."}
        </p>
      </header> 

       <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className='hover:shadow-lg transition-shadow duration-300 hover:scale-105'>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t("OurMission")||"Our Mission"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
              {t("To deliver innovative solutions that exceed customer expectations while maintaining the highest standards of quality and service.")||"To deliver innovative solutions that exceed customer expectations while maintaining the highest standards of quality and service."}


              </p>
            </CardContent>
          </Card>
          
          <Card className='hover:shadow-lg transition-shadow duration-300 hover:scale-105'>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>
                {t("OurTeam")||"Our Team"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {t("Our diverse team of professionals brings together years of experience and expertise across various industries.")||"Our diverse team of professionals brings together years of experience and expertise across various industries."}
              </p>
            </CardContent>
          </Card>
          
          <Card className='hover:shadow-lg transition-shadow duration-300 hover:scale-105'>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>
                  {t("OurValues")||"Our Values"}
                </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                  {t("Integrity, innovation, excellence, and customer satisfaction are the core values that guide everything we do.")|| "Integrity, innovation, excellence, and customer satisfaction are the core values that guide everything we do"}

               
              </p>
            </CardContent>
          </Card>
        </div>
      </section> 

      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("OurHistory")||"Our History"}</CardTitle>
            <CardDescription>{t("The journey that brought us here")||"The journey that brought us here"} </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg"> {t("OurHistoryBeginning")||"2025: The Beginning"} </h3>
              <p> {t("Our company was founded with a vision to revolutionize the industry with innovative solutions.")||"Our company was founded with a vision to revolutionize the industry with innovative solutions."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("OurHistoryExpansion")||"2015: Expansion"}</h3>
              <p>{t("We expanded our operations in Egypt, opening offices in major cities around Egypt.")||"We expanded our operations in Egypt, opening offices in major cities around Egypt."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("OurHistoryInnovation")||"2020: Innovation"}</h3>
              <p>{t("Launched our award-winning platform that has transformed how our clients manage their business.")||"Launched our award-winning platform that has transformed how our clients manage their business."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("OurHistoryToday")||"Today"}</h3>
              <p>{t("Continuing our journey of growth and innovation, serving thousands of satisfied customers worldwide.")||"Continuing our journey of growth and innovation, serving thousands of satisfied customers worldwide."}</p>
            </div>
          </CardContent>
        </Card>
      </section>

     

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t("OurLeadershipTeam")||"Our Leadership Team"}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {!founders || founders.length === 0 ? (
            // Skeleton loading UI
            Array.from({ length: 2 }).map((_, idx) => (
              <Card key={idx} className="animate-pulse bg-gray-50 dark:bg-gray-800/40 shadow-none">
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-3" />
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            founders.map((founder, index) => (
              <Card key={index} className='hover:shadow-lg transition-shadow duration-300 hover:scale-105'>
                <CardHeader>
                  <CardTitle>{`${isRTL ? founder.translations?.[1]?.name || founder.name : founder.translations?.[0]?.name ||founder.name}`}</CardTitle>
                  <CardDescription>{`${isRTL ? founder.translations?.[1]?.job_title || founder.job_title : founder.translations?.[0]?.job_title || founder.job_title}`}</CardDescription>
                  <Image src={`${mediaURL}${founder.image.id}`} alt={`${isRTL ? founder.translations?.[1]?.name || founder.name : founder.translations?.[0]?.name ||founder.name}`} width={64} height={64} className="h-16 w-16 rounded-full" />
                </CardHeader>
                <CardContent>
                  <p>{`${isRTL ? founder.translations?.[1]?.description || founder.description : founder.translations?.[0]?.description || founder.description}`}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div> 

    </>
 )
}

export default AboutPage