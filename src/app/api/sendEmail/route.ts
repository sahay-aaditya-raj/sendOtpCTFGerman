/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/server-utils";

const SECRET_KEY = process.env.MAIL_SECRET_KEY;
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
};

function withCors(response: NextResponse) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

export async function OPTIONS() {
    return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: Request) {
    if (!SECRET_KEY) {
        console.error("MAIL_SECRET_KEY is not configured.");
        return withCors(
            NextResponse.json(
                { success: false, message: "Server misconfiguration: secret key unavailable." },
                { status: 500 }
            )
        );
    }

    try {
        const { email, otp, secretKey, subject } = await request.json();

        if (!email || !otp || !secretKey) {
            return withCors(
                NextResponse.json(
                    { success: false, message: "Missing required fields." },
                    { status: 400 }
                )
            );
        }

        if (secretKey !== SECRET_KEY) {
            return withCors(
                NextResponse.json(
                    { success: false, message: "Invalid secret key." },
                    { status: 403 }
                )
            );
        }
        const plainText = String(otp);
        const emailHtml = `
          <div style="max-width:600px;margin:auto;padding:20px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
            <p style="white-space:pre-line;font-size:16px;color:#2c2c2c;">${plainText}</p>
          </div>
        `;

        // await sendEmail(email, subject || "CTFd Notification", plainText, emailHtml);
        console.log("Email sending temporarily disabled.");

        return withCors(NextResponse.json({ success: true, message: "Mail sent" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending mail:", message);
    return withCors(
      NextResponse.json({ success: false, message: "Failed to send mail", error: message }, { status: 500 })
    );
  }
}

export async function GET() {
    return NextResponse.json({ message: "GET method is not supported on this endpoint. Server active" });
}
