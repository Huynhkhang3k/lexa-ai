import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  bootstrapAuthEnv,
  getAuthSecret,
  getGoogleCredentials,
  isGoogleAuthConfigured,
} from "./auth-env";
import { upsertOAuthUser, verifyUser } from "./user-store";

bootstrapAuthEnv();

const { clientId: googleId, clientSecret: googleSecret } = getGoogleCredentials();

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mật khẩu", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;

      const user = await verifyUser(email, password);
      if (!user) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

if (googleId && googleSecret) {
  providers.unshift(
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const stored = await upsertOAuthUser({ email: user.email, name: user.name });
        user.id = stored.id;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email && account?.provider === "google") {
        const stored = await upsertOAuthUser({ email: user.email, name: user.name });
        token.id = stored.id;
        token.email = user.email;
        token.name = user.name;
      } else if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: getAuthSecret(),
  debug: process.env.NODE_ENV === "development",
};

export { isGoogleAuthConfigured };
