import User from '../models/user.model.js';
import Referral from '../models/referral.model.js';
import ReferralReward from '../models/referralReward.model.js';
import Order from '../models/order.model.js';

const REWARD_AMOUNT = 50; // Configure default store credit reward

export const generateReferralCode = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    if (user.referralCode) return user.referralCode;

    const code = `${user.name.substring(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Ensure uniqueness
    let existing = await User.findOne({ referralCode: code });
    let finalCode = code;
    while (existing) {
        finalCode = `${user.name.substring(0, 3).toUpperCase()}${Math.floor(10000 + Math.random() * 90000)}`;
        existing = await User.findOne({ referralCode: finalCode });
    }

    user.referralCode = finalCode;
    await user.save();
    return finalCode;
};

export const getReferralDashboard = async (userId) => {
    const referrals = await Referral.find({ referrer: userId });
    
    const stats = {
        total: referrals.length,
        successful: referrals.filter(r => r.status === 'rewarded').length,
        pending: referrals.filter(r => ['pending', 'registered', 'qualified'].includes(r.status)).length,
        rejected: referrals.filter(r => r.status === 'rejected').length
    };

    const user = await User.findById(userId);
    const totalRewards = await ReferralReward.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, total: { $sum: '$rewardValue' } } }
    ]);

    return {
        stats,
        credits: user.walletBalance || 0,
        totalEarned: totalRewards[0]?.total || 0,
        referrals: referrals.map(r => ({
            id: r._id,
            status: r.status,
            reward: r.rewardAmount,
            date: r.createdAt
        }))
    };
};

export const processReferralOnRegister = async (referralCode, newUser) => {
    if (!referralCode) return;

    const referrer = await User.findOne({ referralCode });
    if (!referrer || referrer._id.toString() === newUser._id.toString()) return;

    // Check duplicate
    const existing = await Referral.findOne({ referredUser: newUser._id });
    if (existing) return;

    newUser.referredBy = referrer._id;
    await newUser.save();

    await Referral.create({
        referrer: referrer._id,
        referredUser: newUser._id,
        referralCode,
        status: 'registered',
        rewardType: 'store_credit',
        rewardAmount: REWARD_AMOUNT
    });
};

export const processReferralOnPurchase = async (orderId) => {
    const order = await Order.findById(orderId).populate('user');
    if (!order || !order.user || !order.user.referredBy) return;

    if (order.paymentStatus !== 'completed') return;

    const referral = await Referral.findOne({ 
        referredUser: order.user._id,
        status: { $in: ['registered', 'qualified'] } 
    });

    if (!referral) return;

    // Validate fraud: Same IP or self-referral checks can go here
    
    referral.status = 'rewarded';
    referral.completedAt = new Date();
    await referral.save();

    // Grant Reward
    await ReferralReward.create({
        referral: referral._id,
        user: referral.referrer,
        rewardType: referral.rewardType,
        rewardValue: referral.rewardAmount
    });

    await User.findByIdAndUpdate(referral.referrer, {
        $inc: { walletBalance: referral.rewardAmount }
    });
};
