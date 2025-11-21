import { useState } from 'react'
import { sendMessage } from '@/callAPI/aiChat'
import { AI_SYSTEM_PROMPT } from './constants'

interface AiResponse {
  estimated_price: number
  name_translations: { en: string; ar: string }
  description_translations: { en: string; ar: string }
  city_translations: { en: string; ar: string }
  street_translations: { en: string; ar: string }
}

export const useAiEstimation = (
  toast: any,
  t: (key: string) => string,
  formGetValues: any,
  geo_location: any,
  images: File[]
) => {
  const [aiPriceEstimation, setAiPriceEstimation] = useState<number | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiPriceEstimationHint, setAiPriceEstimationHint] = useState(false)

  const requestAiPriceEstimate = async () => {
    const { name, description, category, status_item, price } = formGetValues()

    try {
      // Check if all required fields are filled
      if (
        !name ||
        !description ||
        !category ||
        !status_item ||
        !price ||
        !geo_location ||
        Object.keys(geo_location).length === 0 ||
        !images ||
        images.length === 0
      ) {
        toast({
          title: t('error') || 'ERROR',
          description:
            t('PleasefillnamedesccatcondpricegeoimagesAI') ||
            'Please fill in the item name, description, category, condition, price, location and upload at least one image for AI price estimation.',
          variant: 'destructive',
        })
        return
      }

      // Get location context for AI
      const locationContext =
        geo_location && geo_location.lat && geo_location.lng
          ? `Coordinates: ${geo_location.lat.toFixed(6)}, ${geo_location.lng.toFixed(6)} (${geo_location.name || 'User Location'})`
          : 'Location: Not specified'

      // Build the AI input message
      const aiInputMessage = `Please analyze the provided images along with the following item details to provide an accurate price estimation:
        Item Details:
        - Name: ${name}
        - Description: ${description}
        - Location: ${locationContext}
        - User Location Details: Country: ${formGetValues('country')}, City: ${formGetValues('city')}, Street: ${formGetValues('street')}
        - Category: ${category}
        - Base Price Reference: ${price} EGP
        - Condition: ${status_item}
        
        Please examine the uploaded images carefully and provide:
        1. Visual condition assessment based on the images
        2. Brand/model identification if visible
        3. Quality and wear analysis from the images
        4. Market value estimation considering visual condition
        
        For location translations, please provide proper location names based on the user's country, city, and street information provided above. Do not use generic terms like "Current Location".
        
        please return ONLY a JSON response in this format:
        {
        "estimated_price": [number in EGP],
        "name_translations": { "en": "...", "ar": "..." },
        "description_translations": { "en": "...", "ar": "..." },
        "city_translations": { "en": "...", "ar": "..." },
        "street_translations": { "en": "...", "ar": "..." }
        }`

      setAiInput(aiInputMessage)
      setIsEstimating(true)

      // Use enhanced AI function with automatic retry (3 attempts, starting with 1 second delay)
      const aiResponse = await sendMessage(aiInputMessage, AI_SYSTEM_PROMPT, 3, 1000)

      // Check if AI request was successful
      if (!aiResponse.success) {
        throw new Error(
          aiResponse.error || t('AIrequestfailedafterallretryattempts') || 'AI request failed after all retry attempts'
        )
      }

      let jsonString = aiResponse.text

      // Extract JSON from markdown code blocks if present
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }

      // Clean up any remaining markdown or extra characters
      jsonString = jsonString.trim()

      const jsonObject = JSON.parse(jsonString)

      // Validate the parsed response
      if (!jsonObject.estimated_price || jsonObject.estimated_price === 0) {
        throw new Error('AI returned invalid price estimation')
      }

      setAiResponse(jsonObject)
      setAiPriceEstimation(jsonObject.estimated_price)

      // Show success message with attempt info
      if (aiResponse.attempt > 1) {
        toast({
          title: t('success') || 'Success',
          description: `${t('AIpriceestimationsuccessfulafter') || 'AI price estimation successful after'} ${aiResponse.attempt} ${t('attempts') || 'attempts'}!`,
          variant: 'default',
        })
      }

      setIsEstimating(false)
    } catch (error: any) {
      console.error('Error getting AI price estimate:', error)

      let errorMessage =
        t('FailedtogetAIpriceestimatePleasetryagainorenteryourownestimate') ||
        'Failed to get AI price estimate. Please try again or enter your own estimate.'

      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        errorMessage = 'AI response format error. The AI returned invalid JSON format.'
      } else if (error.message.includes('retry attempts')) {
        errorMessage =
          'AI service is currently unavailable. All retry attempts failed. Please try again later.'
      } else if (error.message.includes('invalid price')) {
        errorMessage = 'AI returned invalid price estimation. Please enter your own estimate.'
      }

      toast({
        title: t('error') || 'ERROR',
        description: t(errorMessage) || errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsEstimating(false)
    }
  }

  return {
    aiPriceEstimation,
    isEstimating,
    aiResponse,
    aiInput,
    aiPriceEstimationHint,
    setAiPriceEstimation,
    setAiPriceEstimationHint,
    requestAiPriceEstimate,
  }
}
