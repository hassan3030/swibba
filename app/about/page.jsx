"use client";
import {useState , useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Award } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";

const AboutPage = () => {
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 800);
  //   return () => clearTimeout(timer);
  // }, []);
  //   const { t } = useTranslations();

  // if (loading) return <LoadingPage />;

  return (
    <>
<div className="container mx-auto py-10 px-4 max-w-6xl">
      {/* <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{t("AboutOurCompany")||"About Our Company"}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
{t("We're dedicated to providing exceptional services and products to our customers around the world")||"We're dedicated to providing exceptional services and products to our customers around the world."}
        </p>
      </header> */}

      {/* <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
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
          
          <Card>
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
          
          <Card>
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
      </section> */}

      <section className="mb-16">
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("OurHistory")||"Our History"}</CardTitle>
            <CardDescription>t{t("The journey that brought us here")||"The journey that brought us here"} </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg"> {t("OurHistory")||"2010: The Beginning"} </h3>
              <p>Our company was founded with a vision to revolutionize the industry with innovative solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">2015: Expansion</h3>
              <p>We expanded our operations globally, opening offices in major cities around the world.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">2020: Innovation</h3>
              <p>Launched our award-winning platform that has transformed how our clients manage their business.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Today</h3>
              <p>Continuing our journey of growth and innovation, serving thousands of satisfied customers worldwide.</p>
            </div>
          </CardContent>
        </Card> */}
      </section>

      {/* <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Our Leadership Team</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Jane Smith",
              title: "Chief Executive Officer",
              description: "With over 20 years of experience in the industry, Jane leads our company with vision and expertise."
            },
            {
              name: "John Johnson",
              title: "Chief Technology Officer",
              description: "John oversees all technical aspects of the company, driving innovation and technological advancement."
            },
            {
              name: "Sarah Williams",
              title: "Chief Operations Officer",
              description: "Sarah ensures smooth operations and optimal efficiency across all departments and regions."
            }
          ].map((leader, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{leader.name}</CardTitle>
                <CardDescription>{leader.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{leader.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}
    </div> 


 
  

    </>
 )
}

export default AboutPage