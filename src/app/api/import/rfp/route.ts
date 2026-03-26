import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `You are an expert government procurement analyst. Analyze the RFP/RFI document provided and extract structured information.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "title": "Full solicitation title",
  "agency": "Issuing agency or department name",
  "solicitationNumber": "Solicitation/RFP/RFI number or null if not found",
  "dueDate": "Submission deadline in ISO format YYYY-MM-DD or null if not found",
  "issueDate": "Issue date in ISO format YYYY-MM-DD or null if not found",
  "contactEmail": "Primary point of contact email or null",
  "summary": "2-3 sentence executive summary of what this solicitation is asking for",
  "scope": "1-2 sentence description of the scope/purpose",
  "requirements": [
    { "text": "Requirement description", "priority": "mandatory" | "preferred" | "optional", "category": "technical" | "compliance" | "experience" | "general" }
  ],
  "glossary": [
    { "term": "Abbreviation or term", "definition": "What it means" }
  ],
  "evaluationCriteria": [
    { "criterion": "Criterion name", "weight": "percentage or null", "description": "Brief description" }
  ],
  "timeline": [
    { "date": "Date string as written in document", "event": "Milestone description" }
  ],
  "complianceFlags": ["Any certifications, clearances, or compliance requirements called out (e.g. CJIS, FedRAMP, ITAR, SBA 8(a))"],
  "verticalTags": ["Relevant tags from: smart-city, transit, emergency, utilities, traffic, public-safety, surveillance, ai, computer-vision"],
  "estimatedValue": "Contract value range or null if not stated",
  "setAside": "Small business set-aside type or null (e.g. 8(a), HUBZone, SDVOSB)",
  "naicsCode": "NAICS code or null"
}

Be thorough. Extract ALL requirements listed. For glossary, extract all abbreviations and defined terms. If the document is an RFI (not RFP), note that in the summary.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Set it in .env.local to enable RFP analysis." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isTxt = fileType === "text/plain" || fileName.endsWith(".txt") || fileName.endsWith(".md");
  const isDocx = fileName.endsWith(".docx") || fileName.endsWith(".doc");

  if (!isPDF && !isTxt && !isDocx) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF, TXT, or DOCX file." },
      { status: 400 }
    );
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 20 MB." }, { status: 400 });
  }

  try {
    let message;

    if (isPDF) {
      // Send PDF directly as a document block
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });
    } else {
      // Read as text
      const text = await file.text();

      if (!text.trim()) {
        return NextResponse.json({ error: "File appears to be empty." }, { status: 400 });
      }

      // Truncate if extremely long
      const truncated = text.length > 100_000 ? text.slice(0, 100_000) + "\n\n[Document truncated]" : text;

      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n---\n\nDOCUMENT:\n${truncated}`,
          },
        ],
      });
    }

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any markdown fences if present
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const analysis = JSON.parse(jsonText);

    return NextResponse.json({ ok: true, analysis, fileName: file.name });
  } catch (err) {
    console.error("[rfp-import]", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Could not parse Claude's response as JSON. Try again or use a text file." },
        { status: 500 }
      );
    }

    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
