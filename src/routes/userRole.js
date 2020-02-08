import {Router} from 'express';
import utils from '../utils';

const router = Router();


// Gets all roles.
router.get('/', async (req, res) => {
	try {
		if (await utils.validateToken(req, res)) {
			const roles = await req.context.models.UserRole.findAll({
				attributes: ['id', 'role', 'description']
			});

			return res.send(roles);
		}

		throw 'Invalid input';
	} catch {
		res.status(400).send('Invalid input');
	}
});

// Gets a specific role.
router.get('/:role', async (req, res) => {
	try {
		if (await utils.validateToken(req, res)) {
			const user = await req.context.models.UserRole.findOne({
				where: {
					role: req.params.role
				},
				attributes: ['id', 'role', 'description']
			});

			return res.send(user);
		}

		throw 'Invalid input';
	} catch {
		res.status(400).send('Invalid payload');
	}
});

// Creates a new role.
router.post('/', async (req, res) => {
	try {
		if(await utils.validateToken(req, res)) {
			const {role, description} = req.body;

			const newRole = await req.context.models.UserRole.create({role, description});
			return res.send(newRole.role + ' created');
		}  

		throw 'Invalid input';
	} catch {
		return res.status(400).send('Invalid input');
	}
});

// Updates any role.
router.put('/', async (req, res) => {
	try {
		if (await utils.validateToken(req, res)) {
			/** @todo add email and phone update options */
			const {id, role, description} = req.body;

			const updatedRole = await req.context.models.UserRole.findOne({
				where: {
					id
				}
			});

            updatedRole.role = role;
            updatedRole.description = description;
			await updatedRole.save();

			return res.send(updatedRole.role + ' updated');
		}

		throw 'Invalid input';
	} catch {
		res.status(400).send('Invalid input');
	}
});

// Deletes a role.
router.delete('/:role', async (req, res) => {
	try {
		if (await utils.validateToken(req, res)) {
			const role = await req.context.models.UserRole.findOne({
				where: {
					role: req.params.role
				}
			});
			await role.destroy();
			return res.send(req.params.role + ' deleted');
		}

		throw 'Invalid input';
	} catch {
		res.status(400).send('Invalid input');
	}
});

export default router;
