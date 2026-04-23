import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getDashboardInsights(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a healthcare operations analyst for HospEase. 
      Analyze this dashboard data and provide 3 concise bullet points of strategic advice.
      Keep it professional, data-driven, and focused on hospital network growth and trip efficiency.
      Data: ${JSON.stringify(data)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Failed to generate insights", error);
    return "AI Insights currently unavailable. Connect your Gemini API key to enable strategic analysis.";
  }
}
