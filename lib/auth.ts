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
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            // Add user ID and role to session
            if (session.user) {
                try {
                    // Optimized: Use token data if available first
                    if (token.role) {
                        session.user.role = token.role;
                        if (token.sub) session.user.id = token.sub;
                    }

                    // Only query DB if absolutely necessary (e.g., role not in token)
                    if (!session.user.role) {
                        await connectDB();
                        const dbUser = await User.findOne({ email: session.user.email });
                        if (dbUser) {
                            session.user.id = (dbUser as any)._id.toString();
                            session.user.role = (dbUser as any).role;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user for session:', error);
                }
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
    secret: process.env.NEXTAUTH_SECRET || 'gopi-misthan-bhandar-secret-key-2024',
};
