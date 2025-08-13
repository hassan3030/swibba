"use client";
import {useState , useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Award } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { teamMembers } from "../../lib/data";
import Image from 'next/image';

const AboutPage = () => {
  
  
    const { t } = useTranslations();



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
          {teamMembers.map((leader, index) => (
            <Card key={index} className='hover:shadow-lg transition-shadow duration-300 hover:scale-105'>
              <CardHeader>
                <CardTitle>{t(leader.name)}</CardTitle>
                <CardDescription>{t(leader.title)}</CardDescription>
                <Image src={leader.image} alt={t(leader.name)} width={64} height={64} className="h-16 w-16 rounded-full" />
              </CardHeader>
              <CardContent>
                <p>{t(leader.description)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div> 


 
  

    </>
 )
}

export default AboutPage