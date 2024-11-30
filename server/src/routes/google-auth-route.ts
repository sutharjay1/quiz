import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	async (req, res) => {
		try {
			if (!req.user) {
				return res.redirect('/login');
			}

			res.redirect(`${process.env.CLIENT_URL}/signin?auth=success`);
		} catch (error) {
			console.error('Authentication callback error:', error);
			res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
		}
	}
);

router.get('/profile', (req, res) => {
	if (req.isAuthenticated()) {
		res.json({
			user: req.user,
		});
	} else {
		res.status(401).json({ message: 'Not authenticated' });
	}
});

export { router as authRouter };
