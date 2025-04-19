import { GoogleGenerativeAI } from "@google/generative-ai"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      return Response.json({ error: "GOOGLE_API_KEY is not configured" }, { status: 500 })
    }

    // Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate a simple response
    const result = await model.generateContent("Say hello in one word")
    const text = result.response.text()

    return Response.json({
      success: true,
      message: "API is working correctly",
      response: text,
      apiKeyConfigured: true,
    })
  } catch (error) {
    console.error("Test API error:", error)
    return Response.json(
      {
        success: false,
        error: "API test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
