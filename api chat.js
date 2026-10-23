export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "طريقة الطلب غير مسموحة"
    });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح الذكاء الاصطناعي غير موجود في إعدادات Vercel"
      });
    }

    const body = req.body || {};

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [
          {
            role: "user",
            content: body.message || body.question || body.text || body.prompt || ""
          }
        ];

    if (
      messages.length === 0 ||
      !messages.some(
        (m) => m && m.role === "user" && typeof m.content === "string" && m.content.trim()
      )
    ) {
      return res.status(400).json({
        error: "اكتب رسالتك أولًا"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "ZAYED AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "أنت زيزو، مساعد ZAYED AI. أجب باللغة العربية بأسلوب واضح وودود، واستخدم اللهجة المصرية عندما تناسب السؤال. اشرح المعلومات العلمية بدقة وبخطوات منظمة."
            },
            ...messages
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "تعذر الاتصال بالذكاء الاصطناعي حاليًا"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: typeof reply === "string" ? reply : "",
      answer: typeof reply === "string" ? reply : ""
    });
  } catch (error) {
    return res.status(500).json({
      error: "حصل خطأ أثناء الاتصال بالذكاء الاصطناعي"
    });
  }
}
