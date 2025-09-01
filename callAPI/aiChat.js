// process the input and send it to the API
//"http://localhost:3000/api/chat"

//"http://localhost:3000/api/chat"
export  async function sendMessage( input, systemPrompt) {
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
    // console.log(data);
    
    // Structure response for easy access via res.key
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




