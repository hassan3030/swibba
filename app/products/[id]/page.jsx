import { notFound } from "next/navigation"
import { 
  getProductWithSEO, 
  getSEOTranslation, 
  buildOGImageURL, 
  buildProductURL,
  getProductImageURL 
} from "@/callAPI/seo"
import ProductPageClient from "./product-page-client"

// Server-side data fetching for SEO
async function getProduct(id) {
  const result = await getProductWithSEO(id)
  return result
}

// Generate dynamic metadata for SEO and Open Graph
export async function generateMetadata({ params }) {
  const { id } = await params
  const result = await getProduct(id)

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found | SWIBBA",
      description: "The product you're looking for could not be found.",
    }
  }

  const product = result.data
  const seo = product.seo
  
  // Get SEO translation (default to English)
  const seoTranslation = getSEOTranslation(seo, "en-US")
  
  // Build OG image URL - prioritize SEO og_image, then first product image
  const ogImageUrl = seo?.og_image 
    ? buildOGImageURL(seo.og_image)
    : getProductImageURL(product)

  // Get product translation for fallback
  const productTranslation = product.translations?.find(t => t.languages_code === "en-US") 
    || product.translations?.[0]

  // Build metadata
  const title = seoTranslation?.meta_title || productTranslation?.name || product.name || "Product"
  const description = seoTranslation?.meta_description || productTranslation?.description || product.description || ""
  const keywords = seoTranslation?.meta_keywords || []
  const ogTitle = seoTranslation?.open_graph_title || title
  const ogDescription = seoTranslation?.open_graph_description || description
  const canonicalUrl = buildProductURL(id)

  return {
    title: `${title} | SWIBBA`,
    description: description.substring(0, 160),
    keywords: keywords.join(", "),
    authors: [{ name: "SWIBBA" }],
    creator: "SWIBBA",
    publisher: "SWIBBA",
    
    // Open Graph
    openGraph: {
      title: ogTitle,
      description: ogDescription.substring(0, 200),
      url: canonicalUrl,
      siteName: "SWIBBA",
      type: "website",
      locale: "en_US",
      alternateLocale: "ar_SA",
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ] : [],
    },
    
    // Twitter Card
    twitter: {
      card: seoTranslation?.twitter_card || "summary_large_image",
      title: ogTitle,
      description: ogDescription.substring(0, 200),
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    
    // Additional meta
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-US": `${canonicalUrl}?lang=en`,
        "ar-SA": `${canonicalUrl}?lang=ar`,
      },
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    
    // Other metadata
    other: {
      "product:price:amount": product.price || product.value_estimate,
      "product:price:currency": product.currency?.toUpperCase() || "EGP",
      "product:availability": product.status_swap === "available" ? "in stock" : "out of stock",
      "product:condition": product.status_item || "new",
      "product:brand": product.brand || "",
      "product:category": product.category || "",
    },
  }
}

// Server Component - fetches data and passes to client
export default async function ProductPage({ params }) {
  const { id } = await params
  const result = await getProduct(id)

  // Only show 404 if the product truly doesn't exist (status 404)
  // For other errors (network, server), we should still try to render
  if (!result.success && result.status === 404) {
    notFound()
  }

  // If there was a different error but we have no data, show 404 as fallback
  if (!result.data) {
    notFound()
  }

  return <ProductPageClient initialProduct={result.data} productId={id} />
}
