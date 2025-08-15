import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "TellerPlan <noreply@tellerplan.com>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Thank you for contacting TellerPlan!</h1>
          <p>Dear ${name},</p>
          <p>We have received your message with the subject: <strong>"${subject}"</strong></p>
          <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your message:</h3>
            <p style="margin-bottom: 0; color: #6b7280;">${message}</p>
          </div>
          
          <p>If you have any urgent questions, you can reach us directly at support@tellerplan.com or +49 (0) 123 456 789.</p>
          
          <p>Best regards,<br>The TellerPlan Team</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "TellerPlan Contact Form <noreply@tellerplan.com>",
      to: ["support@tellerplan.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">New Contact Form Submission</h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">Message:</h3>
            <p style="white-space: pre-wrap; color: #374151;">${message}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Submitted at: ${new Date().toLocaleString('en-US', { 
              timeZone: 'Europe/Berlin',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} CET
          </p>
        </div>
      `,
    });

    console.log("Contact form emails sent successfully:", { userEmailResponse, adminEmailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Contact form submitted successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in send-contact-email function:", message);
    return new Response(
      JSON.stringify({
        error: message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);