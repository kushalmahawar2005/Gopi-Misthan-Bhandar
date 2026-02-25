import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(req: Request) {
    try {
        await connectDB();

        // Parse the request body
        const body = await req.json();
        const { name, email, phone, message } = body;

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return NextResponse.json(
                { success: false, error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // 1. Save data to MongoDB
        const newContact = await Contact.create({
            name,
            email,
            phone,
            message,
        });

        // 2. Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS, // This is your App Password
            },
        });

        // Email 1 (To the Owner)
        const mailOptionsToOwner = {
            from: process.env.SMTP_USER,
            to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
            subject: `New Contact Form Submission from ${name}`,
            html: `
        <h2>New Query Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        };

        // Email 2 (To the User)
        const mailOptionsToUser = {
            from: process.env.SMTP_USER,
            to: email,
            subject: `Thank you for contacting us, ${name}!`,
            html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${name},</p>
        <p>We have successfully received your query.</p>
        <p><strong>Your Message:</strong></p>
        <p><em>"${message}"</em></p>
        <p>Our team will review it and get back to you soon.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Gopi Misthan Bhandar Team</strong></p>
      `,
        };

        // 3. Send emails simultaneously
        try {
            await Promise.all([
                transporter.sendMail(mailOptionsToOwner),
                transporter.sendMail(mailOptionsToUser),
            ]);

            return NextResponse.json(
                { success: true, message: 'Message sent successfully!', data: newContact },
                { status: 201 }
            );
        } catch (emailError: any) {
            console.error('Email sending failed:', emailError);

            // Even if email fails, return success because data is saved in MongoDB
            return NextResponse.json(
                {
                    success: true,
                    message: 'Data saved successfully, but failed to send email.',
                    data: newContact
                },
                { status: 201 }
            );
        }

    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
