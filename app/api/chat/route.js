import OpenAI from "openai";

export async function POST(req) {
  try {
    console.log("AI API request received");
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format");
      return Response.json(
        { 
          text: "", 
          error: "Invalid messages format" 
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return Response.json(
        { 
          text: "", 
          error: "OpenAI API key not configured" 
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Vision-capable model
      messages: messages ?? [{ role: "user", content: "Hello!" }],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content ?? "";
    
    // Log the response for debugging
    console.log("AI Response received, length:", responseText.length);
    console.log("AI Response preview:", responseText.substring(0, 100) + "...");
    
    // Check if response is empty or invalid
    if (!responseText || responseText.trim() === "" || responseText.trim() === "0") {
      console.warn("AI returned empty or invalid response");
      return Response.json(
        { 
          text: "", 
          error: "AI returned empty or invalid response" 
        },
        { status: 422 }
      );
    }

    return Response.json({
      text: responseText,
      success: true,
    });

  } catch (error) {
    console.error("AI API Error:", error);
    
    // Handle different types of errors
    let errorMessage = "Internal server error";
    let statusCode = 500;
    
    if (error.code === 'insufficient_quota') {
      errorMessage = "OpenAI quota exceeded";
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = "Invalid OpenAI API key";
      statusCode = 401;
    } else if (error.code === 'model_not_found') {
      errorMessage = "AI model not available";
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Response.json(
      { 
        text: "", 
        error: errorMessage,
        code: error.code 
      },
      { status: statusCode }
    );
  }
}
