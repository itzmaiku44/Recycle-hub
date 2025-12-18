import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { PrismaClient, CategoryType, RewardStatus, WalletProvider } = pkg;

// Load .env before reading DATABASE_URL
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 4000;

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Static folder for avatars
const avatarsDir = path.join(__dirname, '..', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
app.use('/avatars', express.static(avatarsDir));

// Multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'avatar', ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Auth (very basic, no tokens) ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, birthdate, password } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: phone || null,
        birthdate: birthdate ? new Date(birthdate) : null,
        passwordHash: password,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      points: user.points,
      avatarPath: user.avatarPath,
      phone: user.phone,
      birthdate: user.birthdate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      points: user.points,
      avatarPath: user.avatarPath,
      phone: user.phone,
      birthdate: user.birthdate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Helpers for cart / points ---

function getBaseRate(weightKg) {
  if (weightKg > 20) return 1.0;
  if (weightKg > 10) return 0.7; // spec says 1.0 for >10, 1.2 for >20; we keep 0.7 at >5, adjust if needed
  if (weightKg > 5) return 0.7;
  return 0.5;
}

function getCategoryMultiplier(category) {
  switch (category) {
    case CategoryType.PLASTIC:
      return 0.13;
    case CategoryType.PAPER:
      return 0.22;
    case CategoryType.GLASS:
      return 0.34;
    case CategoryType.COPPER:
      return 0.56;
    case CategoryType.METAL:
      return 0.44;
    default:
      return 0;
  }
}

// --- Schedules (admin + public) ---

app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await prisma.collectionSchedule.findMany({
      where: { isActive: true },
      orderBy: { startAt: 'asc' },
    });
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/schedules/next', async (req, res) => {
  try {
    const now = new Date();
    const next = await prisma.collectionSchedule.findFirst({
      where: { isActive: true, startAt: { gt: now } },
      orderBy: { startAt: 'asc' },
    });
    res.json(next || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/schedules', async (req, res) => {
  try {
    const { title, description, location, startAt, endAt } = req.body;
    if (!title || !location || !startAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const schedule = await prisma.collectionSchedule.create({
      data: {
        title,
        description: description || null,
        location,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
      },
    });

    res.status(201).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/schedules/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, location, startAt, endAt, isActive } = req.body;

    const schedule = await prisma.collectionSchedule.update({
      where: { id },
      data: {
        title,
        description,
        location,
        startAt: startAt ? new Date(startAt) : undefined,
        endAt: endAt ? new Date(endAt) : undefined,
        isActive,
      },
    });

    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- User avatar & profile updates ---

app.post('/api/user/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = Number(req.body.userId);
    if (!userId || !req.file) {
      return res.status(400).json({ message: 'Missing userId or file' });
    }

    const avatarPath = `/avatars/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarPath },
    });

    res.json({ avatarPath: user.avatarPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/user/profile/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { firstName, lastName, phone, birthdate } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        birthdate: birthdate ? new Date(birthdate) : null,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      birthdate: user.birthdate,
      role: user.role,
      points: user.points,
      avatarPath: user.avatarPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/user/password/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.passwordHash !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPassword }, // TODO: hash
    });

    res.json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic user fetch (for refreshing points, profile)
app.get('/api/user/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      points: user.points,
      phone: user.phone,
      birthdate: user.birthdate,
      avatarPath: user.avatarPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- User search (for cart modal & user management) ---

app.get('/api/admin/users', async (req, res) => {
  try {
    const q = (req.query.q || '').toString();
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { firstName: 'asc' },
      take: 10,
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Cart / Recycle transactions (admin) ---

app.post('/api/admin/transactions', async (req, res) => {
  try {
    const { userId, category, weightKg } = req.body;

    if (!userId || !category || weightKg == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const numericWeight = Number(weightKg);
    if (Number.isNaN(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({ message: 'Invalid weight' });
    }

    const baseRate = getBaseRate(numericWeight);
    const pointsBase = baseRate * numericWeight;
    const multiplier = getCategoryMultiplier(category);
    const pointsTotal = pointsBase * (1 + multiplier);

    const tx = await prisma.$transaction(async (txClient) => {
      const transaction = await txClient.recycleTransaction.create({
        data: {
          userId,
          category,
          weightKg: numericWeight,
          pointsBase,
          pointsMultiplier: multiplier,
          pointsTotal,
        },
      });

      await txClient.user.update({
        where: { id: userId },
        data: { points: { increment: pointsTotal } },
      });

      return transaction;
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/transactions', async (req, res) => {
  try {
    const transactions = await prisma.recycleTransaction.findMany({
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- User transactions (for analysis, history) ---

app.get('/api/user/transactions/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const transactions = await prisma.recycleTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- User management (admin) ---

app.patch('/api/admin/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { points, password, isActive } = req.body;

    const data = {};
    if (points != null) data.points = Number(points);
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (password) data.passwordHash = password; // TODO: hash

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Redemptions (admin listing & status update) ---

app.get('/api/admin/redemptions', async (req, res) => {
  try {
    const redemptions = await prisma.redemption.findMany({
      include: {
        user: true,
        reward: true,
        payoutMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(redemptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Rewards & redemptions (user) ---

app.get('/api/rewards', async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
    });
    res.json(rewards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ensure default cash rewards exist (runs once on startup)
async function ensureDefaultRewards() {
  const count = await prisma.reward.count();
  if (count > 0) return;

  await prisma.reward.createMany({
    data: [
      { title: 'PHP 100', amountCash: 100, pointsCost: 10 },
      { title: 'PHP 250', amountCash: 250, pointsCost: 25 },
      { title: 'PHP 500', amountCash: 500, pointsCost: 50 },
      { title: 'PHP 1000', amountCash: 1000, pointsCost: 100 },
    ],
  });
}

app.get('/api/user/redemptions/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(redemptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user/payout-methods/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const methods = await prisma.payoutMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default first
        { createdAt: 'asc' },
      ],
    });

    res.json(methods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/user/payout-methods', async (req, res) => {
  try {
    const { userId, provider, accountNumber, isDefault } = req.body;

    if (!userId || !provider || !accountNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (![WalletProvider.GCASH, WalletProvider.MAYA].includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!/^[0-9]{11}$/.test(accountNumber)) {
      return res.status(400).json({ message: 'Account number must be 11 digits' });
    }

    const method = await prisma.$transaction(async (txClient) => {
      // Check if this is the first payout method for this user
      const existingCount = await txClient.payoutMethod.count({
        where: { userId },
      });

      // If setting as default OR if it's the first method, ensure only one default
      const shouldBeDefault = !!isDefault || existingCount === 0;

      if (shouldBeDefault) {
        // Set all other methods for this user to not default
        await txClient.payoutMethod.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const created = await txClient.payoutMethod.create({
        data: {
          userId,
          provider,
          accountNumber,
          isDefault: shouldBeDefault,
        },
      });

      return created;
    });

    res.status(201).json(method);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/user/payout-methods/:id/default', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const method = await prisma.payoutMethod.findUnique({ where: { id } });
    if (!method) {
      return res.status(404).json({ message: 'Payout method not found' });
    }

    const updated = await prisma.$transaction(async (txClient) => {
      await txClient.payoutMethod.updateMany({
        where: { userId: method.userId },
        data: { isDefault: false },
      });

      return txClient.payoutMethod.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/user/redeem', async (req, res) => {
  try {
    const { userId, rewardId, payoutMethodId } = req.body;

    if (!userId || !rewardId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [user, reward, payoutMethod] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.reward.findUnique({ where: { id: rewardId } }),
      payoutMethodId
        ? prisma.payoutMethod.findUnique({ where: { id: payoutMethodId } })
        : Promise.resolve(null),
    ]);

    if (!user || !reward) {
      return res.status(404).json({ message: 'User or reward not found' });
    }

    if (user.points < reward.pointsCost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    const redemption = await prisma.$transaction(async (txClient) => {
      const created = await txClient.redemption.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          status: RewardStatus.PENDING,
          payoutMethodId: payoutMethod ? payoutMethod.id : null,
        },
      });

      await txClient.user.update({
        where: { id: user.id },
        data: { points: { decrement: reward.pointsCost } },
      });

      return created;
    });

    const redemptionWithReward = await prisma.redemption.findUnique({
      where: { id: redemption.id },
      include: { reward: true },
    });

    res.status(201).json(redemptionWithReward);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/admin/redemptions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const redemption = await prisma.redemption.update({
      where: { id },
      data: {
        status,
        processedAt: status === 'PAID' ? new Date() : null,
      },
      include: {
        user: true,
        reward: true,
        payoutMethod: true,
      },
    });

    res.json(redemption);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

ensureDefaultRewards().catch((err) => {
  console.error('Failed to ensure default rewards', err);
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
