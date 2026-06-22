import { Router, type IRouter } from "express";
import OpenAI, { toFile } from "openai";
import { randomUUID } from "crypto";
import { z } from "zod";

const router: IRouter = Router();

// ── OpenAI singleton ──────────────────────────────────────────────────────────

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set");
  const cfg: ConstructorParameters<typeof OpenAI>[0] = { apiKey };
  const baseURL = process.env.OPENAI_BASE_URL;
  if (baseURL) cfg.baseURL = baseURL;
  return new OpenAI(cfg);
}

// ── Scenario data ─────────────────────────────────────────────────────────────

const SCENARIOS_DATA: Record<string, { titleEn: string; description: string; role: string }> = {
  order_coffee:       { titleEn: "Order Coffee",             description: "Walk into a coffee shop and order your favourite drink.",                    role: "a friendly barista at a busy coffee shop" },
  order_pizza:        { titleEn: "Order Pizza",              description: "Call or visit a pizza restaurant and place your order.",                     role: "a friendly pizza restaurant employee taking orders" },
  buy_water:          { titleEn: "Buy Water at a Shop",      description: "Ask the shop assistant for water and pay for it.",                           role: "a shop assistant in a convenience store" },
  ask_directions:     { titleEn: "Ask for Directions",       description: "Ask a local how to get to a nearby place.",                                  role: "a helpful local person giving street directions" },
  introduce_yourself: { titleEn: "Introduce Yourself",       description: "Tell someone about yourself: name, where you're from, what you do.",         role: "a friendly new acquaintance meeting you for the first time" },
  buy_bus_ticket:     { titleEn: "Buy a Bus Ticket",         description: "Buy a bus ticket to the destination you need.",                              role: "a bus station ticket agent" },
  ask_price:          { titleEn: "Ask the Price",            description: "Ask about the price of an item in a store.",                                 role: "a shop assistant helping a customer with prices" },
  hotel_checkin:      { titleEn: "Hotel Check-in",           description: "Check in at the hotel reception and find out about your room.",               role: "a polite hotel receptionist" },
  say_what_you_like:  { titleEn: "Talk About Your Hobbies",  description: "Share what you enjoy doing in your free time.",                              role: "a friendly person getting to know your hobbies and interests" },
  meet_new_friend:    { titleEn: "Meet a New Friend",        description: "Strike up a casual conversation and get to know someone new.",                role: "a new acquaintance at a social gathering" },
  buy_painting:       { titleEn: "Buy a Painting",           description: "Talk to a curator and choose a work of art.",                                role: "an art gallery curator helping a customer choose a painting" },
  return_item:        { titleEn: "Return an Item",           description: "Explain why you're returning an item and negotiate an exchange or refund.",   role: "a customer service representative handling returns" },
  book_restaurant:    { titleEn: "Book a Table",             description: "Call the restaurant, choose a time, and specify any preferences.",           role: "a restaurant host taking phone reservations" },
  phone_problem:      { titleEn: "Explain a Phone Problem",  description: "Describe a phone malfunction and ask for help at a repair shop.",            role: "a phone repair shop technician helping a customer" },
  rent_apartment:     { titleEn: "Rent an Apartment",        description: "Talk to the landlord about rental terms.",                                   role: "a landlord showing an apartment to a potential tenant" },
  doctor_symptoms:    { titleEn: "Visit a Doctor",           description: "Describe how you feel and get recommendations in English.",                   role: "a caring doctor listening to a patient's symptoms" },
  travel_plans:       { titleEn: "Discuss Travel Plans",     description: "Tell an agent about your dream route and clarify the details.",               role: "a travel agent helping plan a dream trip" },
  airport_help:       { titleEn: "Help at the Airport",      description: "Sort out boarding, baggage, or a flight delay.",                             role: "an airport staff member helping a confused traveler" },
  small_discount:     { titleEn: "Negotiate a Discount",     description: "Politely ask for a discount when making a purchase.",                        role: "a shop manager considering a discount request" },
  phone_appointment:  { titleEn: "Make an Appointment",      description: "Call a clinic or organisation and arrange a meeting.",                       role: "a clinic receptionist scheduling appointments by phone" },
  hotel_budget:       { titleEn: "Hotel on a Budget",        description: "Negotiate the best price for a night's stay on a tight budget.",             role: "a hotel front desk manager negotiating room rates" },
  job_interview:      { titleEn: "Job Interview",            description: "Go through an interview: talk about your experience, skills, and motivation.", role: "an HR manager conducting a professional job interview" },
  business_meeting:   { titleEn: "Business Meeting",         description: "Negotiate: discuss a project, deadlines, and terms.",                        role: "a business client negotiating project terms and timeline" },
  complain_service:   { titleEn: "Complain About Service",   description: "Politely but persistently express dissatisfaction and get a resolution.",    role: "a customer service manager handling a formal complaint" },
  tech_support:       { titleEn: "Technical Support",        description: "Describe a complex technical problem to a support agent.",                   role: "a senior tech support specialist troubleshooting an issue" },
  contract_terms:     { titleEn: "Contract Negotiations",    description: "Discuss key contract points and defend your interests.",                     role: "a lawyer or business partner reviewing contract terms" },
  startup_pitch:      { titleEn: "Startup Pitch",            description: "Present your startup idea to an investor and convince them of its potential.", role: "a venture capital investor listening to a startup pitch" },
  salary_talk:        { titleEn: "Salary Negotiation",       description: "Professionally discuss compensation with an HR manager.",                    role: "an HR manager discussing salary expectations with a candidate" },
  travel_emergency:   { titleEn: "Travel Emergency",         description: "Handle a crisis: lost passport, illness, or an emergency.",                  role: "an embassy official or emergency services helping a traveler" },
  change_flight:      { titleEn: "Change a Flight",          description: "Call the airline, explain the reason, and rebook your flight.",              role: "an airline customer service agent handling flight changes" },
};

// ── Level-specific instructions ───────────────────────────────────────────────

function levelInstructions(level: string): string {
  if (level === "beginner") return `
The student is a BEGINNER. Use very simple vocabulary and short sentences (max 2 sentences in your reply).
Speak slowly and clearly. Be extremely encouraging.
If the student seems stuck, gently suggest a phrase they could try, e.g. "(You could try saying: '...')"`.trim();

  if (level === "advanced") return `
The student is ADVANCED. Use natural, idiomatic, native-level English. Do not simplify.
Engage deeply and realistically. Use nuanced vocabulary and complex sentence structures.
Respond as you would to a native speaker in this scenario.`.trim();

  // intermediate (default)
  return `
The student has an INTERMEDIATE level. Use normal conversational English.
Keep responses concise (2-3 sentences). Ask natural follow-up questions to keep the conversation going.
Be warm but professional.`.trim();
}

// ── GET /speaktutor/scenarios ─────────────────────────────────────────────────

router.get("/speaktutor/scenarios", (_req, res) => {
  const ids = Object.keys(SCENARIOS_DATA);
  res.json(ids.map((id) => ({ id, ...SCENARIOS_DATA[id] })));
});

// ── POST /speaktutor/chat ─────────────────────────────────────────────────────

const ChatBody = z.object({
  scenarioId: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).default([]),
  userMessage: z.string().default(""),
  isIntro: z.boolean().default(false),
});

router.post("/speaktutor/chat", async (req, res) => {
  try {
    const body = ChatBody.parse(req.body);
    const scenario = SCENARIOS_DATA[body.scenarioId];
    if (!scenario) {
      res.status(400).json({ error: "Unknown scenarioId" });
      return;
    }

    const openai = getOpenAI();

    if (body.isIntro) {
      // Generate scenario intro (Russian context + English opening line)
      const introPrompt = `You are starting a roleplay scenario as: ${scenario.role}.
Scenario: "${scenario.titleEn}" — ${scenario.description}

Generate a scene-setting introduction in Russian (2-3 short sentences describing the situation and your character) followed by your opening English line as the character.

Format EXACTLY like this (no extra symbols, no markdown):
[Russian context sentences here]

[Your opening English line here, starting the conversation naturally]

Ответьте на эту фразу, чтобы начать диалог:`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 300,
        messages: [{ role: "system", content: introPrompt }],
      });

      const reply = completion.choices[0]?.message?.content?.trim() ?? "";
      res.json({ reply });
      return;
    }

    // Normal conversation turn
    const systemPrompt = `You are a professional English conversation coach for Russian-speaking learners.
Your current role in this roleplay: ${scenario.role}
Scenario: "${scenario.titleEn}" — ${scenario.description}
${levelInstructions(body.level)}

CRITICAL RULES:
1. Stay fully in character as ${scenario.role}. Do NOT break character.
2. Your conversational reply must be in English ONLY (2-4 sentences max).
3. Be natural, warm, and encouraging.
4. After your conversational reply, on a new line output a JSON analysis of the student's English in this EXACT format (no markdown, no backticks):
[CORRECTION_START]
{"score":8,"correctedText":"...","grammarMistakes":[],"vocabularyMistakes":[],"nativeSpeakerVersion":"...","explanationRu":"..."}
[CORRECTION_END]

Analysis rules:
- score: 1-10 (10=perfect)
- correctedText: the student's message corrected (keep same if no errors)
- grammarMistakes: specific grammar issues IN RUSSIAN (empty array if none)
- vocabularyMistakes: better word suggestions IN RUSSIAN (empty array if none)
- nativeSpeakerVersion: how a native speaker would phrase the student's message
- explanationRu: 1-2 sentence overall feedback IN RUSSIAN (encouraging, specific)`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...body.history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      })),
      { role: "user", content: body.userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 600,
      messages,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim() ?? "";

    // Parse reply and correction
    const corrStart = rawContent.indexOf("[CORRECTION_START]");
    const corrEnd = rawContent.indexOf("[CORRECTION_END]");

    let reply = rawContent;
    let correction: Record<string, unknown> | undefined;

    if (corrStart !== -1 && corrEnd !== -1) {
      reply = rawContent.slice(0, corrStart).trim();
      const jsonStr = rawContent.slice(corrStart + "[CORRECTION_START]".length, corrEnd).trim();
      try {
        correction = JSON.parse(jsonStr) as Record<string, unknown>;
        if (correction) correction.originalText = body.userMessage;
      } catch {
        // correction stays undefined
      }
    }

    res.json({ reply, correction });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "AI service error. Please try again." });
  }
});

// ── POST /speaktutor/hint ─────────────────────────────────────────────────────

const HintBody = z.object({
  scenarioId: z.string().min(1),
  level: z.string().default("beginner"),
  lastAIMessage: z.string().default(""),
});

router.post("/speaktutor/hint", async (req, res) => {
  try {
    const body = HintBody.parse(req.body);
    const scenario = SCENARIOS_DATA[body.scenarioId];
    if (!scenario) { res.status(400).json({ error: "Unknown scenarioId" }); return; }

    const openai = getOpenAI();
    const prompt = `A Russian learner is practicing English in a roleplay scenario: "${scenario.titleEn}".
The AI character just said: "${body.lastAIMessage}"
Student level: ${body.level}

Give a SHORT, practical hint in Russian (2-3 sentences) to help the student respond.
Include one useful English phrase they could use, in quotes.
Be encouraging and specific. Do NOT give the full answer.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const hint = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ hint });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "hint error" });
  }
});

// ── POST /speaktutor/transcribe  (also aliased as /transcribe) ───────────────

const TranscribeBody = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default("audio/webm"),
});

async function handleTranscribe(req: import("express").Request, res: import("express").Response) {
  // Check API key first — return 503 with structured code so frontend can show a nice message
  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: "OPENAI_API_KEY не настроен", code: "NO_API_KEY" });
    return;
  }

  try {
    const body = TranscribeBody.parse(req.body);
    const openai = getOpenAI();
    const audioBuffer = Buffer.from(body.audioBase64, "base64");
    const baseType = body.mimeType.split(";")[0].trim();
    const ext =
      baseType === "audio/mp4" ? "mp4" :
      baseType === "audio/ogg" ? "ogg" :
      baseType === "audio/wav" ? "wav" : "webm";
    const file = await toFile(audioBuffer, `audio.${ext}`, { type: baseType });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });
    res.json({ text: transcription.text });
  } catch (e) {
    req.log.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
}

// Primary endpoint
router.post("/speaktutor/transcribe", handleTranscribe);
// Clean alias used by frontend: POST /api/transcribe
router.post("/transcribe", handleTranscribe);

// ── POST /speaktutor/tts ──────────────────────────────────────────────────────

const TTSBody = z.object({
  text: z.string().min(1),
  voice: z.string().default("nova"),
});

router.post("/speaktutor/tts", async (req, res) => {
  try {
    const body = TTSBody.parse(req.body);
    const openai = getOpenAI();
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: (body.voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer") ?? "nova",
      input: body.text,
    });
    const arrayBuffer = await response.arrayBuffer();
    res.json({ audioBase64: Buffer.from(arrayBuffer).toString("base64") });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// ── YooKassa payments (no user auth required) ─────────────────────────────────

const YOOKASSA_API = "https://api.yookassa.ru/v3";
const PRICE_RUB = "1500.00";
const PRICE_DESCRIPTION = "SpeakTutor AI — полный доступ (60 AI-сообщений)";

const CreatePaymentBody = z.object({
  returnUrl: z.string().url().optional(),
});

// POST /api/payments/create
router.post("/payments/create", async (req, res) => {
  try {
    const body = CreatePaymentBody.parse(req.body);
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      req.log.warn("YooKassa credentials not configured");
      res.status(503).json({ error: "Платёжный сервис временно недоступен" });
      return;
    }

    const origin = req.headers["origin"] as string | undefined;
    const base = origin ?? "https://speaktutor.ru";
    const basePath = process.env.BASE_PATH ?? "/speaktutor";
    const returnUrl = body.returnUrl ?? `${base}${basePath}/payment/return`;

    const idempotenceKey = randomUUID();
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    const ykRes = await fetch(`${YOOKASSA_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: { value: PRICE_RUB, currency: "RUB" },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        description: PRICE_DESCRIPTION,
        metadata: { product: "speaktutor_1500" },
      }),
    });

    if (!ykRes.ok) {
      const errBody = await ykRes.text();
      req.log.error({ status: ykRes.status, body: errBody }, "YooKassa create payment failed");
      res.status(502).json({ error: "Ошибка платёжного сервиса. Попробуйте позже." });
      return;
    }

    const ykData = await ykRes.json() as {
      id: string;
      confirmation?: { confirmation_url?: string };
    };

    // Return the YooKassa payment ID — frontend saves it to localStorage before redirect
    res.json({
      yookassaPaymentId: ykData.id,
      confirmationUrl: ykData.confirmation?.confirmation_url ?? null,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// GET /api/payments/:ykPaymentId/status — poll YooKassa directly (no DB needed)
router.get("/payments/:ykPaymentId/status", async (req, res) => {
  try {
    const { ykPaymentId } = req.params;

    if (!ykPaymentId || !/^[\w-]+$/.test(ykPaymentId)) {
      res.status(400).json({ error: "Invalid payment ID" });
      return;
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      res.status(503).json({ error: "Payment service not configured" });
      return;
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
    const ykRes = await fetch(`${YOOKASSA_API}/payments/${ykPaymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!ykRes.ok) {
      res.status(ykRes.status).json({ error: "Payment lookup failed", status: "failed" });
      return;
    }

    const ykData = await ykRes.json() as { status: string; paid: boolean };
    // YooKassa statuses: pending, waiting_for_capture, succeeded, canceled
    const status = ykData.status === "succeeded" || ykData.paid ? "paid" :
                   ykData.status === "canceled" ? "failed" : "pending";

    res.json({ status, ykStatus: ykData.status });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: String(e) });
  }
});

export default router;
