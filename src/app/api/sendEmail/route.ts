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

async function mailto(email: string, otp: string) {
    const subject = "OTP Verification for Your Account Registration";
    const plainText = `Your OTP is ${otp}. Please use this to complete your registration.`;
    const emailHtml = `
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2c2c2c; padding: 24px;">
            <h1 style="color: #5a3e2b; font-size: 28px; margin-bottom: 16px;">OTP Verification</h1>
            <p style="font-size: 16px; margin-bottom: 12px;">Dear User,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Your OTP is <strong style="color: #5a3e2b;">${otp}</strong>. Please use this to complete your registration.
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">If you did not request this, please ignore this email.</p>
        </div>`;

    await sendEmail(email, subject, plainText, emailHtml);
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
        const { email, otp, secretKey } = await request.json();

        if (!email || !otp || !secretKey) {
            return withCors(
                NextResponse.json(
                    { success: false, message: "Missing email, otp, or secretKey in request body." },
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

        await mailto(email, String(otp));

        return withCors(NextResponse.json({ success: true, message: "Mail sent." }));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error sending OTP email:", message);
        return withCors(
            NextResponse.json(
                { success: false, message: "Failed to send mail.", error: message },
                { status: 500 }
            )
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "GET method is not supported on this endpoint. Server active" });
}