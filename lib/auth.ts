import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account.provider === 'google') {
                try {
                    await connectDB();

                    // Check if user exists
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create new user
                        // Generate a random password since it's required by the schema
                        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

                        await User.create({
                            name: user.name,
                            email: user.email,
                            password: randomPassword,
                            role: 'user',
                            // We could add googleId field to schema later if needed
                        });
                    }

                    return true;
                } catch (error) {
                    console.error('Error in Google signIn callback:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'user';
            } else if (!token.role) {
                // If token exists but no role (e.g. after initial login), 
                // we might want a one-time DB check or just rely on initial login.
                // However, since Middleware needs role, we ensure it's here.
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ email: token.email }) as any;
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                    }
                } catch (error) {
                    console.error('Error in jwt callback:', error);
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string as ?error=
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Start-up safety check
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is missing! High security risk in production.');
}

