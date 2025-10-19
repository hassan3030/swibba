// process the input and send it to the API with automatic retry functionality
//"http://localhost:3000/api/chat"

// Helper function to check if response is valid
function isValidResponse(response) {
  if (!response || !response.text) return false;
  
  // Check if response is empty or just whitespace
  if (response.text.trim() === "") return false;
  
  // Check if response is "0" or contains only "0"
  if (response.text.trim() === "0") return false;
  
  // Check if response contains meaningful content (at least 5 characters for JSON)
  if (response.text.trim().length < 5) return false;
  
  // Check if response looks like JSON (starts with { or [)
  const trimmedText = response.text.trim();
  if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[') && !trimmedText.includes('```')) {
    console.warn('Response does not appear to be JSON format:', trimmedText.substring(0, 100));
    return false;
  }
  
  return true;
}

// Helper function to add delay between retries
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendMessage(input, systemPrompt, maxRetries = 3, retryDelay = 1000) {
    let lastError = null;
    
    // Validate input before making requests
    if (!input || input.trim() === '') {
        console.error('AI Request failed: Empty input provided');
        return {
            text: "",
            success: false,
            status: 400,
            error: "Empty input provided",
            data: null,
            attempts: 0
        };
    }
    
    if (!systemPrompt || systemPrompt.trim() === '') {
        console.error('AI Request failed: Empty system prompt provided');
        return {
            text: "",
            success: false,
            status: 400,
            error: "Empty system prompt provided",
            data: null,
            attempts: 0
        };
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`AI Request attempt ${attempt}/${maxRetries}`);
            console.log(`Input length: ${input.length} characters`);
            
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: input },
                    ],
                }),
            });

            const data = await res.json();
            
            const response = {
                text: data.text || "", 
                success: res.ok,
                status: res.status,
                data: data,
                attempt: attempt
            };
            
            // Check if response is valid
            if (res.ok && isValidResponse(response)) {
                console.log(`AI Request successful on attempt ${attempt}`);
                return response;
            }
            
            // If response is invalid, treat as failure
            console.warn(`AI Request attempt ${attempt} returned invalid response:`, data.text || 'empty');
            lastError = new Error(`Invalid AI response: ${data.text || data.error || 'empty response'}`);
            
            // If this isn't the last attempt, wait before retrying
            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await delay(retryDelay);
                // Increase delay for next attempt (exponential backoff)
                retryDelay *= 1.5;
            }
            
        } catch (error) {
            console.error(`AI Request attempt ${attempt} failed:`, error);
            lastError = error;
            
            // If this isn't the last attempt, wait before retrying
            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await delay(retryDelay);
                // Increase delay for next attempt (exponential backoff)
                retryDelay *= 1.5;
            }
        }
    }
    
    // All attempts failed
    console.error(`All ${maxRetries} AI request attempts failed. Last error:`, lastError);
    return {
        text: "",
        success: false,
        status: 500,
        error: lastError?.message || "All retry attempts failed",
        data: null,
        attempts: maxRetries
    };
}

// Legacy function for backward compatibility
export async function sendMessageLegacy(input, systemPrompt) {
    try{ 
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: input },
                ],
            }),
        });

        const data = await res.json();
        
        return {
            text: data.text, 
            success: res.ok,
            status: res.status,
            data: data
        };
    } catch (error) {
        console.error("Error sending message:", error);
        return {
            text: "",
            success: false,
            status: 500,
            error: error.message,
            data: null
        };
    }
}




