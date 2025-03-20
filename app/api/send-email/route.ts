import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

export async function POST(req: Request) {
  try {
    const body: EmailRequest = await req.json();

    if (!body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 465, // Use 587 for TLS, 465 for SSL
      secure: true, // True for 465, false for 587
      auth: {
        user: "apikey", // Must be literally "apikey"
        pass: process.env.NEXT_PUBLIC_SENDGRID_API_KEY as string, // Ensure API Key is present
      },
    });

    await transporter.sendMail({
      from: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL as string, // Must be a verified sender
      to: body.to,
      subject: body.subject,
      html: body.html,
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
