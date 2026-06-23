import { generateReferralCode, getReferralDashboard } from '../services/referral.service.js';
import Referral from '../models/referral.model.js';
import ReferralReward from '../models/referralReward.model.js';
import User from '../models/user.model.js';

export const getDashboard = async (req, res) => {
    try {
        const dashboard = await getReferralDashboard(req.user._id);
        res.status(200).json({ success: true, data: dashboard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLink = async (req, res) => {
    try {
        const code = await generateReferralCode(req.user._id);
        const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${code}`;
        res.status(200).json({ success: true, data: { code, url } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const referrals = await Referral.find({ referrer: req.user._id })
            .populate('referredUser', 'name email createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Referral.countDocuments({ referrer: req.user._id });

        res.status(200).json({
            success: true,
            data: referrals,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRewards = async (req, res) => {
    try {
        const rewards = await ReferralReward.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: rewards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminAnalytics = async (req, res) => {
    try {
        const totalReferrals = await Referral.countDocuments();
        const successful = await Referral.countDocuments({ status: 'rewarded' });
        const pending = await Referral.countDocuments({ status: { $in: ['pending', 'registered'] } });
        const rejected = await Referral.countDocuments({ status: 'rejected' });
        
        const rewardsDistributed = await ReferralReward.aggregate([
            { $group: { _id: null, total: { $sum: '$rewardValue' } } }
        ]);

        const topAffiliates = await Referral.aggregate([
            { $match: { status: 'rewarded' } },
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topAffiliatesData = await User.populate(topAffiliates, { path: '_id', select: 'name email' });

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                successful,
                pending,
                rejected,
                rewardsDistributed: rewardsDistributed[0]?.total || 0,
                topAffiliates: topAffiliatesData.map(a => ({
                    user: a._id,
                    referrals: a.count
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
