import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
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
        async session({ session, token }: any) {
            // Add user ID and role to session
            if (session.user) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ email: session.user.email });
                    if (dbUser) {
                        session.user.id = dbUser._id.toString();
                        session.user.role = dbUser.role;
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

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
