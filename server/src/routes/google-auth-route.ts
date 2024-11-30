import { NextFunction, Request, Response, Router } from 'express';
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
	passport.authenticate('google', {
		failureRedirect: `${process.env.CLIENT_URL}/signin?auth=failed`,
	}),
	async (req, res) => {
		try {
			if (!req.user) {
				return res.redirect(
					`${process.env.CLIENT_URL}/signin?auth=failed`
				);
			}

			req.login(req.user, (err) => {
				if (err) {
					console.error('Login error:', err);
					return res.redirect(
						`${process.env.CLIENT_URL}/signin?auth=failed`
					);
				}

				res.cookie('auth', 'success', {
					httpOnly: true,
					secure: true,
					sameSite: 'none',
					maxAge: 24 * 60 * 60 * 1000,
				});

				res.redirect(`${process.env.CLIENT_URL}/signin?auth=success`);
			});
		} catch (error) {
			console.error('Authentication callback error:', error);
			res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
		}
	}
);

router.get('/profile', ((req: Request, res: Response) => {
	if (req.isAuthenticated()) {
		return res.json({
			user: req.user,
			authenticated: true,
		});
	}

	res.status(401).json({
		message: 'Not authenticated',
	});
}) as (req: Request, res: Response, next: NextFunction) => void);

export { router as authRouter };
