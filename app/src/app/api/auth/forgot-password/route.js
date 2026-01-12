import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  await dbConnect();

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // For security, return success even if user doesn't exist
      return NextResponse.json({ 
        message: 'If an account exists with this email, password reset instructions have been sent.' 
      }, { status: 200 });
    }

    // Generate a temporary password (8 characters)
    const tempPassword = crypto.randomBytes(4).toString('hex');
    
    // Update user's password to the temporary one
    user.passwordHash = tempPassword;
    await user.save();

    // Send email with Nodemailer if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Create transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // Email content
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'AIU Smart Cafe - Password Reset',
          text: `Your temporary password is: ${tempPassword}\n\nPlease login with this password and change it immediately in your profile settings.\n\nIf you did not request this password reset, please contact support immediately.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #10b981; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">AIU Smart Cafe</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #1f2937;">Password Reset Request</h2>
                <p style="color: #4b5563; font-size: 16px;">
                  We received a request to reset your password. Your temporary password is:
                </p>
                <div style="background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                  <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0; font-family: monospace;">
                    ${tempPassword}
                  </p>
                </div>
                <p style="color: #4b5563; font-size: 16px;">
                  <strong>Important:</strong> Please login with this temporary password and change it immediately in your profile settings.
                </p>
                <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">
                  If you did not request this password reset, please contact support immediately.
                </p>
              </div>
              <div style="background-color: #1f2937; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} AIU Smart Cafe. All rights reserved.
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to: ${email}`);

        return NextResponse.json({ 
          message: 'Password reset instructions have been sent to your email. Please check your inbox.' 
        }, { status: 200 });

      } catch (emailError) {
        console.error('Email error:', emailError);
        
        // Fall back to console logging if email fails
        console.log(`=================================================`);
        console.log(`EMAIL FAILED - TEMPORARY PASSWORD FOR: ${email}`);
        console.log(`Temporary Password: ${tempPassword}`);
        console.log(`=================================================`);
        
        return NextResponse.json({ 
          message: 'Password has been reset, but we could not send the email. Please contact support.',
          tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
        }, { status: 200 });
      }
    } else {
      // Development mode - log to console
      console.log(`=================================================`);
      console.log(`TEMPORARY PASSWORD FOR: ${email}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log(`=================================================`);
      console.log(`NOTE: Email not configured. Set EMAIL_USER and EMAIL_PASS in .env.local`);

      return NextResponse.json({ 
        message: 'Password reset successful. Check server console for temporary password.',
        tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
