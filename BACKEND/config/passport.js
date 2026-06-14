import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.model.js';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.findOne({ email: profile.emails?.[0]?.value });
                if (user) {
                    user.googleId = profile.id;
                    user.provider = 'google';
                    if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
                    await user.save();
                } else {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value || `${profile.id}@google-oauth.local`,
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        provider: 'google'
                    });
                }
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || profile.username || `${profile.id}@github-oauth.local`;
            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                user = await User.findOne({ email });
                if (user) {
                    user.githubId = profile.id;
                    user.provider = 'github';
                    if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
                    await user.save();
                } else {
                    user = await User.create({
                        name: profile.displayName || profile.username,
                        email,
                        githubId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        provider: 'github'
                    });
                }
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
